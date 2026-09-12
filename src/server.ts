import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { parseSolanaWebhook } from "./actions/signals.js";
import { transferToken2022WithFee } from "./actions/token2022.js";
import { createMultisigAccount } from "./actions/squads.js";
import { generateBlinkUrl } from "./actions/blinks.js";
import {
  openPerpPosition,
  getPerpMarketInfo,
} from "./actions/perps.js";
import {
  executeLendingAction,
  getLendingRates,
} from "./actions/lending.js";
import {
  executePumpFunTrade,
  getPumpFunTokenInfo,
} from "./actions/pumpfun.js";
import { getPortfolio } from "./actions/portfolio.js";
import { getJitoStakeQuote } from "./actions/stake.js";

import { SolanaAgent } from "./agent.js";
import {
  lendingSchema,
  pumpfunTradeSchema,
} from "./tools.js";
import { validateRiskLimits } from "./security/risk-engine.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));

const PORT = Number(process.env.PORT || 3000);

const RPC_URL =
  process.env.SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

const publicKeySchema = z.string().min(32).max(44);

const portfolioSchema = z
  .object({
    walletAddress: publicKeySchema,
  })
  .strict();

const stakeQuoteSchema = z
  .object({
    amountSol: z.number().finite().positive().max(10).default(1),
  })
  .strict();

const perpOpenSchema = z
  .object({
    market: z.string().min(1).max(64),
    side: z.enum(["long", "short"]),
    leverage: z.number().finite().min(1).max(10),
    collateralAmount: z.number().finite().positive().max(10),
    stopLossPrice: z.number().finite().positive().optional(),
    takeProfitPrice: z.number().finite().positive().optional(),
  })
  .strict();

const squadsCreateSchema = z
  .object({
    threshold: z.number().int().positive(),
    members: z.array(publicKeySchema).min(1).max(10),
  })
  .strict()
  .refine(
    (data) => data.threshold <= data.members.length,
    {
      message: "Threshold cannot exceed number of members",
      path: ["threshold"],
    },
  );

const token2022TransferSchema = z
  .object({
    mint: publicKeySchema,
    destination: publicKeySchema,
    amount: z.number().finite().positive(),
  })
  .strict();

const blinkSchema = z
  .record(z.string(), z.unknown());

function apiError(
  res: Response,
  status: number,
  code: string,
  message: string,
) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

function validateBody<T extends z.ZodTypeAny>(
  schema: T,
  req: Request,
  res: Response,
): z.infer<T> | null {
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    apiError(
      res,
      400,
      "INVALID_PAYLOAD",
      firstIssue?.message || "Invalid request body",
    );

    return null;
  }

  return parsed.data;
}

function safeSecretEquals(
  provided: string,
  expected: string,
): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}

function requireExecutionAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const apiKey = process.env.SOLANA_AGENT_API_KEY;

  /*
   * Secure by default:
   * without an API key, HTTP execution is disabled.
   */
  if (!apiKey) {
    return apiError(
      res,
      503,
      "EXECUTION_DISABLED",
      "SOLANA_AGENT_API_KEY is not configured",
    );
  }

  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return apiError(
      res,
      401,
      "UNAUTHORIZED",
      "Bearer token required",
    );
  }

  const provided = authorization.slice("Bearer ".length);

  if (!safeSecretEquals(provided, apiKey)) {
    return apiError(
      res,
      401,
      "UNAUTHORIZED",
      "Invalid bearer token",
    );
  }

  next();
}

function getExecutionContext() {
  const agent = new SolanaAgent(RPC_URL);

  if (agent.isReadOnly()) {
    throw new Error(
      "READ_ONLY_MODE: AGENT_PRIVATE_KEY is not configured",
    );
  }

  return {
    connection: agent.connection,
    signer: agent.requireSigner(),
  };
}

function executionError(
  res: Response,
  error: unknown,
) {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  if (message.startsWith("READ_ONLY_MODE")) {
    return apiError(
      res,
      503,
      "READ_ONLY_MODE",
      message,
    );
  }

  return apiError(
    res,
    500,
    "EXECUTION_ERROR",
    message,
  );
}

/* ------------------------------------------------------------------ */
/* Health / capabilities                                               */
/* ------------------------------------------------------------------ */

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "solana-agent-skill-api",
    executionConfigured: Boolean(
      process.env.SOLANA_AGENT_API_KEY &&
      process.env.AGENT_PRIVATE_KEY
    ),
  });
});

/* ------------------------------------------------------------------ */
/* Read-only endpoints                                                 */
/* ------------------------------------------------------------------ */

app.post("/portfolio", async (req, res) => {
  try {
    const body = validateBody(
      portfolioSchema,
      req,
      res,
    );

    if (!body) return;

    const data = await getPortfolio(
      RPC_URL,
      body.walletAddress,
    );

    res.json(data);
  } catch (error) {
    apiError(
      res,
      500,
      "PORTFOLIO_ERROR",
      error instanceof Error
        ? error.message
        : String(error),
    );
  }
});

app.post("/stake/jito", async (req, res) => {
  try {
    const body = validateBody(
      stakeQuoteSchema,
      req,
      res,
    );

    if (!body) return;

    const data = await getJitoStakeQuote(
      body.amountSol,
    );

    res.json(data);
  } catch (error) {
    apiError(
      res,
      500,
      "STAKE_QUOTE_ERROR",
      error instanceof Error
        ? error.message
        : String(error),
    );
  }
});

app.get("/api/pumpfun/info/:mint", async (req, res) => {
  try {
    const parsed = publicKeySchema.safeParse(
      req.params.mint,
    );

    if (!parsed.success) {
      return apiError(
        res,
        400,
        "INVALID_MINT",
        "Invalid mint address",
      );
    }

    const data = await getPumpFunTokenInfo(
      parsed.data,
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    apiError(
      res,
      500,
      "PUMPFUN_INFO_ERROR",
      error instanceof Error
        ? error.message
        : String(error),
    );
  }
});

app.get("/api/lending/rates", async (req, res) => {
  const protocolSchema = z.enum([
    "kamino",
    "marginfi",
  ]);

  const parsed = protocolSchema.safeParse(
    req.query.protocol || "kamino",
  );

  if (!parsed.success) {
    return apiError(
      res,
      400,
      "INVALID_PROTOCOL",
      "protocol must be kamino or marginfi",
    );
  }

  const data = await getLendingRates(
    parsed.data,
  );

  res.json(data);
});

app.get("/api/perps/market/:symbol", async (req, res) => {
  try {
    const market = z
      .string()
      .min(1)
      .max(64)
      .parse(req.params.symbol);

    const data = await getPerpMarketInfo(
      market,
    );

    res.json(data);
  } catch (error) {
    apiError(
      res,
      400,
      "INVALID_MARKET",
      error instanceof Error
        ? error.message
        : String(error),
    );
  }
});

/* ------------------------------------------------------------------ */
/* Authenticated execution endpoints                                   */
/* ------------------------------------------------------------------ */

app.post(
  "/api/pumpfun/trade",
  requireExecutionAuth,
  async (req, res) => {
    try {
      const body = validateBody(
        pumpfunTradeSchema.strict(),
        req,
        res,
      );

      if (!body) return;

      const risk = validateRiskLimits({
        amount: body.amount,
        slippageBps: body.slippageBps,
      });

      if (!risk.valid) {
        return apiError(
          res,
          403,
          risk.code || "RISK_REJECTED",
          risk.message || "Risk policy rejected transaction",
        );
      }

      const { connection, signer } =
        getExecutionContext();

      const result = await executePumpFunTrade(
        connection,
        signer,
        body,
      );

      res.status(result.success ? 200 : 422).json(
        result,
      );
    } catch (error) {
      executionError(res, error);
    }
  },
);

app.post(
  "/api/lending/action",
  requireExecutionAuth,
  async (req, res) => {
    try {
      const body = validateBody(
        lendingSchema.strict(),
        req,
        res,
      );

      if (!body) return;

      const risk = validateRiskLimits({
        amount: body.amount,
      });

      if (!risk.valid) {
        return apiError(
          res,
          403,
          risk.code || "RISK_REJECTED",
          risk.message || "Risk policy rejected action",
        );
      }

      const { connection, signer } =
        getExecutionContext();

      const result = await executeLendingAction(
        connection,
        signer,
        body,
      );

      res.json(result);
    } catch (error) {
      executionError(res, error);
    }
  },
);

app.post(
  "/api/perps/open",
  requireExecutionAuth,
  async (req, res) => {
    try {
      const body = validateBody(
        perpOpenSchema,
        req,
        res,
      );

      if (!body) return;

      const risk = validateRiskLimits({
        amount: body.collateralAmount,
        leverage: body.leverage,
      });

      if (!risk.valid) {
        return apiError(
          res,
          403,
          risk.code || "RISK_REJECTED",
          risk.message || "Risk policy rejected position",
        );
      }

      const { connection, signer } =
        getExecutionContext();

      const result = await openPerpPosition(
        connection,
        signer,
        body,
      );

      res.json(result);
    } catch (error) {
      executionError(res, error);
    }
  },
);

app.post(
  "/api/squads/create",
  requireExecutionAuth,
  async (req, res) => {
    try {
      const body = validateBody(
        squadsCreateSchema,
        req,
        res,
      );

      if (!body) return;

      const { connection, signer } =
        getExecutionContext();

      const result = await createMultisigAccount(
        connection,
        signer,
        body,
      );

      res.json(result);
    } catch (error) {
      executionError(res, error);
    }
  },
);

app.post(
  "/api/token2022/transfer",
  requireExecutionAuth,
  async (req, res) => {
    try {
      const body = validateBody(
        token2022TransferSchema,
        req,
        res,
      );

      if (!body) return;

      const { connection, signer } =
        getExecutionContext();

      const result =
        await transferToken2022WithFee(
          connection,
          signer,
          body,
        );

      res.json(result);
    } catch (error) {
      executionError(res, error);
    }
  },
);

/* ------------------------------------------------------------------ */
/* Utility / integration endpoints                                     */
/* ------------------------------------------------------------------ */

app.post("/api/blinks/generate", (req, res) => {
  const parsed = blinkSchema.safeParse(req.body);

  if (!parsed.success) {
    return apiError(
      res,
      400,
      "INVALID_PAYLOAD",
      "Invalid Blink payload",
    );
  }

  try {
    res.json(generateBlinkUrl(parsed.data as any));
  } catch (error) {
    apiError(
      res,
      400,
      "BLINK_ERROR",
      error instanceof Error
        ? error.message
        : String(error),
    );
  }
});

app.post("/api/webhook/solana", (req, res) => {
  try {
    const result = parseSolanaWebhook(
      req.body,
    );

    res.json(result);
  } catch (error) {
    apiError(
      res,
      400,
      "INVALID_WEBHOOK",
      error instanceof Error
        ? error.message
        : String(error),
    );
  }
});

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`,
    );

    console.log(
      process.env.AGENT_PRIVATE_KEY
        ? "Execution signer: configured"
        : "Execution signer: READ-ONLY",
    );

    console.log(
      process.env.SOLANA_AGENT_API_KEY
        ? "HTTP execution auth: enabled"
        : "HTTP execution auth: disabled",
    );
  });
}

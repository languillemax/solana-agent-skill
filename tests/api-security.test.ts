import test from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";

process.env.NODE_ENV = "test";

const { app } = await import("../src/server.js");

app.locals.t3nGate = async () => ({
  approved: true,
  did: "did:t3n:test-api-security",
  address: "0xtest",
});

async function withServer(
  callback: (baseUrl: string) => Promise<void>,
) {
  const server: Server = app.listen(0, "127.0.0.1");

  await new Promise<void>((resolve, reject) => {
    server.once("listening", () => resolve());
    server.once("error", reject);
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Unable to determine test server port");
  }

  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

const validPumpFunBody = {
  mint: "So11111111111111111111111111111111111111112",
  action: "buy",
  amount: 0.1,
  denominatedInSol: true,
  slippageBps: 100,
};

test(
  "API Security - execution disabled when API key is not configured",
  async () => {
    const previousApiKey = process.env.SOLANA_AGENT_API_KEY;

    delete process.env.SOLANA_AGENT_API_KEY;

    try {
      await withServer(async (baseUrl) => {
        const response = await fetch(
          `${baseUrl}/api/pumpfun/trade`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify(validPumpFunBody),
          },
        );

        const body: any = await response.json();

        assert.equal(response.status, 503);
        assert.equal(body.success, false);
        assert.equal(
          body.error.code,
          "EXECUTION_DISABLED",
        );
      });
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.SOLANA_AGENT_API_KEY;
      } else {
        process.env.SOLANA_AGENT_API_KEY =
          previousApiKey;
      }
    }
  },
);

test(
  "API Security - invalid bearer token is rejected",
  async () => {
    const previousApiKey = process.env.SOLANA_AGENT_API_KEY;

    process.env.SOLANA_AGENT_API_KEY =
      "test-api-key";

    try {
      await withServer(async (baseUrl) => {
        const response = await fetch(
          `${baseUrl}/api/pumpfun/trade`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: "Bearer wrong-key",
            },
            body: JSON.stringify(validPumpFunBody),
          },
        );

        const body: any = await response.json();

        assert.equal(response.status, 401);
        assert.equal(body.success, false);
        assert.equal(
          body.error.code,
          "UNAUTHORIZED",
        );
      });
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.SOLANA_AGENT_API_KEY;
      } else {
        process.env.SOLANA_AGENT_API_KEY =
          previousApiKey;
      }
    }
  },
);

test(
  "API Security - privateKey injection is rejected",
  async () => {
    const previousApiKey = process.env.SOLANA_AGENT_API_KEY;

    process.env.SOLANA_AGENT_API_KEY =
      "test-api-key";

    try {
      await withServer(async (baseUrl) => {
        const response = await fetch(
          `${baseUrl}/api/pumpfun/trade`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: "Bearer test-api-key",
            },
            body: JSON.stringify({
              ...validPumpFunBody,
              privateKey: "[1,2,3]",
            }),
          },
        );

        const body: any = await response.json();

        assert.equal(response.status, 400);
        assert.equal(body.success, false);
        assert.equal(
          body.error.code,
          "INVALID_PAYLOAD",
        );
      });
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.SOLANA_AGENT_API_KEY;
      } else {
        process.env.SOLANA_AGENT_API_KEY =
          previousApiKey;
      }
    }
  },
);

test(
  "API Security - rpcUrl injection is rejected",
  async () => {
    const previousApiKey = process.env.SOLANA_AGENT_API_KEY;

    process.env.SOLANA_AGENT_API_KEY =
      "test-api-key";

    try {
      await withServer(async (baseUrl) => {
        const response = await fetch(
          `${baseUrl}/api/pumpfun/trade`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: "Bearer test-api-key",
            },
            body: JSON.stringify({
              ...validPumpFunBody,
              rpcUrl: "https://attacker.invalid",
            }),
          },
        );

        const body: any = await response.json();

        assert.equal(response.status, 400);
        assert.equal(body.success, false);
        assert.equal(
          body.error.code,
          "INVALID_PAYLOAD",
        );
      });
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.SOLANA_AGENT_API_KEY;
      } else {
        process.env.SOLANA_AGENT_API_KEY =
          previousApiKey;
      }
    }
  },
);

test(
  "API Security - authenticated execution requires configured signer",
  async () => {
    const previousApiKey = process.env.SOLANA_AGENT_API_KEY;
    const previousPrivateKey = process.env.AGENT_PRIVATE_KEY;

    process.env.SOLANA_AGENT_API_KEY =
      "test-api-key";
    delete process.env.AGENT_PRIVATE_KEY;

    try {
      await withServer(async (baseUrl) => {
        const response = await fetch(
          `${baseUrl}/api/pumpfun/trade`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: "Bearer test-api-key",
            },
            body: JSON.stringify(validPumpFunBody),
          },
        );

        const body: any = await response.json();

        assert.equal(response.status, 503);
        assert.equal(body.success, false);
        assert.equal(
          body.error.code,
          "READ_ONLY_MODE",
        );
      });
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.SOLANA_AGENT_API_KEY;
      } else {
        process.env.SOLANA_AGENT_API_KEY =
          previousApiKey;
      }

      if (previousPrivateKey === undefined) {
        delete process.env.AGENT_PRIVATE_KEY;
      } else {
        process.env.AGENT_PRIVATE_KEY =
          previousPrivateKey;
      }
    }
  },
);

import {
  test,
} from "node:test";

import assert from "node:assert/strict";

import {
  t3nAdapter,
} from "../src/t3n.js";

test(
  "T3N Adapter - Exposes available tools",
  () => {
    const tools =
      t3nAdapter
        .getAvailableTools();

    assert.ok(
      tools.length >= 3,
    );

    assert.ok(
      tools.some(
        (tool) =>
          tool.name ===
          "PUMPFUN_BUY",
      ),
    );
  },
);

test(
  "T3N Adapter - Rejects invalid parameters via Zod",
  async () => {
    const result =
      await t3nAdapter
        .executeAction({
          toolName:
            "PUMPFUN_BUY",
          parameters: {
            mint: "short",
            amountSol: -1,
          },
        });

    assert.equal(
      result.success,
      false,
    );

    assert.equal(
      result.error?.code,
      "INVALID_PARAMETERS",
    );
  },
);

test(
  "T3N Adapter - Rejects actions exceeding risk limits",
  async () => {
    const result =
      await t3nAdapter
        .executeAction({
          toolName:
            "PUMPFUN_BUY",
          parameters: {
            mint:
              "So11111111111111111111111111111111111111112",
            amountSol: 500,
            slippage: 1,
          },
        });

    assert.equal(
      result.success,
      false,
    );

    assert.equal(
      result.error?.code,
      "RISK_LIMIT_EXCEEDED",
    );
  },
);

test(
  "T3N Adapter - Partial risk config preserves default limits",
  async () => {
    const result =
      await t3nAdapter
        .executeAction({
          toolName:
            "PUMPFUN_BUY",
          parameters: {
            mint:
              "So11111111111111111111111111111111111111112",
            amountSol: 500,
            slippage: 1,
          },
          context: {
            riskConfig: {
              maxSlippageBps:
                100,
            },
          },
        });

    assert.equal(
      result.success,
      false,
    );

    assert.equal(
      result.error?.code,
      "RISK_LIMIT_EXCEEDED",
    );
  },
);

test(
  "T3N Adapter - Logical gate is not mislabeled as on-chain simulation",
  async () => {
    const result =
      await t3nAdapter
        .executeAction({
          toolName:
            "PUMPFUN_BUY",
          parameters: {
            mint:
              "So11111111111111111111111111111111111111112",
            amountSol: 1,
            slippage: 1,
          },
        });

    assert.equal(
      result.success,
      true,
    );

    assert.equal(
      result.data
        ?.executionAuthorized,
      true,
    );

    assert.equal(
      result.data
        ?.simulationMode,
      "logical",
    );

    assert.equal(
      result.data
        ?.onchainSimulation,
      false,
    );

    assert.equal(
      result.data
        ?.t3nAuthenticated,
      false,
    );
  },
);

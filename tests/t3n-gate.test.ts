import test from "node:test";
import assert from "node:assert/strict";

import {
  t3nSecurityGate,
} from "../src/security/t3n-gate.js";

test(
  "T3N Gate - rejects unauthenticated state",
  async () => {
    const result =
      await t3nSecurityGate(
        async () => ({
          configured: true,
          authenticated: false,
          environment: "sandbox",
          error:
            "AUTH_FAILED",
        }),
      );

    assert.equal(
      result.approved,
      false,
    );

    assert.equal(
      result.error,
      "AUTH_FAILED",
    );
  },
);

test(
  "T3N Gate - approves authenticated DID",
  async () => {
    const result =
      await t3nSecurityGate(
        async () => ({
          configured: true,
          authenticated: true,
          environment: "sandbox",
          did:
            "did:t3n:test",
          address:
            "0x123",
        }),
      );

    assert.equal(
      result.approved,
      true,
    );

    assert.equal(
      result.did,
      "did:t3n:test",
    );
  },
);

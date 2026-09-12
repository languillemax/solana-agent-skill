import test from "node:test";
import assert from "node:assert/strict";

import {
  getT3nLiveStatus,
} from "../src/t3n-live.js";

test(
  "T3N Live - missing API key fails closed without network call",
  async () => {
    const previousKey =
      process.env.T3N_API_KEY;

    const previousEnv =
      process.env.T3N_ENV;

    delete process.env
      .T3N_API_KEY;

    process.env.T3N_ENV =
      "sandbox";

    try {
      const status =
        await getT3nLiveStatus();

      assert.equal(
        status.configured,
        false,
      );

      assert.equal(
        status.authenticated,
        false,
      );

      assert.equal(
        status.environment,
        "sandbox",
      );

      assert.equal(
        status.did,
        undefined,
      );
    } finally {
      if (
        previousKey ===
        undefined
      ) {
        delete process.env
          .T3N_API_KEY;
      } else {
        process.env
          .T3N_API_KEY =
          previousKey;
      }

      if (
        previousEnv ===
        undefined
      ) {
        delete process.env
          .T3N_ENV;
      } else {
        process.env
          .T3N_ENV =
          previousEnv;
      }
    }
  },
);

test(
  "T3N Live - sandbox is the safe default",
  async () => {
    const previousKey =
      process.env.T3N_API_KEY;

    const previousEnv =
      process.env.T3N_ENV;

    delete process.env
      .T3N_API_KEY;

    delete process.env
      .T3N_ENV;

    try {
      const status =
        await getT3nLiveStatus();

      assert.equal(
        status.environment,
        "sandbox",
      );
    } finally {
      if (
        previousKey !==
        undefined
      ) {
        process.env
          .T3N_API_KEY =
          previousKey;
      }

      if (
        previousEnv !==
        undefined
      ) {
        process.env
          .T3N_ENV =
          previousEnv;
      }
    }
  },
);

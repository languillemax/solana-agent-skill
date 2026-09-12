import test from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";

process.env.NODE_ENV = "test";

const { app } =
  await import("../src/server.js");

async function withServer(
  callback: (
    baseUrl: string,
  ) => Promise<void>,
) {
  const server: Server =
    app.listen(
      0,
      "127.0.0.1",
    );

  await new Promise<void>(
    (resolve, reject) => {
      server.once(
        "listening",
        resolve,
      );

      server.once(
        "error",
        reject,
      );
    },
  );

  const address =
    server.address();

  if (
    !address ||
    typeof address === "string"
  ) {
    throw new Error(
      "Unable to determine test server port",
    );
  }

  try {
    await callback(
      `http://127.0.0.1:${address.port}`,
    );
  } finally {
    await new Promise<void>(
      (resolve, reject) => {
        server.close(
          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          },
        );
      },
    );
  }
}

const body = {
  mint:
    "So11111111111111111111111111111111111111112",
  action: "buy",
  amount: 0.1,
  denominatedInSol: true,
  slippageBps: 100,
};

test(
  "API T3N Gate - rejected T3N identity blocks execution before signer",
  async () => {
    const oldApiKey =
      process.env
        .SOLANA_AGENT_API_KEY;

    const oldSigner =
      process.env
        .AGENT_PRIVATE_KEY;

    process.env
      .SOLANA_AGENT_API_KEY =
      "test-api-key";

    delete process.env
      .AGENT_PRIVATE_KEY;

    app.locals.t3nGate =
      async () => ({
        approved: false,
        error:
          "T3N_TEST_REJECTED",
      });

    try {
      await withServer(
        async (baseUrl) => {
          const response =
            await fetch(
              `${baseUrl}/api/pumpfun/trade`,
              {
                method: "POST",
                headers: {
                  authorization:
                    "Bearer test-api-key",
                  "content-type":
                    "application/json",
                },
                body:
                  JSON.stringify(
                    body,
                  ),
              },
            );

          const json =
            await response.json();

          assert.equal(
            response.status,
            503,
          );

          assert.equal(
            json.error?.code,
            "T3N_AUTH_REQUIRED",
          );

          assert.equal(
            json.error?.message,
            "T3N_TEST_REJECTED",
          );
        },
      );
    } finally {
      if (
        oldApiKey ===
        undefined
      ) {
        delete process.env
          .SOLANA_AGENT_API_KEY;
      } else {
        process.env
          .SOLANA_AGENT_API_KEY =
          oldApiKey;
      }

      if (
        oldSigner ===
        undefined
      ) {
        delete process.env
          .AGENT_PRIVATE_KEY;
      } else {
        process.env
          .AGENT_PRIVATE_KEY =
          oldSigner;
      }
    }
  },
);

test(
  "API T3N Gate - approved DID reaches signer boundary",
  async () => {
    const oldApiKey =
      process.env
        .SOLANA_AGENT_API_KEY;

    const oldSigner =
      process.env
        .AGENT_PRIVATE_KEY;

    process.env
      .SOLANA_AGENT_API_KEY =
      "test-api-key";

    delete process.env
      .AGENT_PRIVATE_KEY;

    app.locals.t3nGate =
      async () => ({
        approved: true,
        did:
          "did:t3n:http-test",
        address:
          "0x123",
      });

    try {
      await withServer(
        async (baseUrl) => {
          const response =
            await fetch(
              `${baseUrl}/api/pumpfun/trade`,
              {
                method: "POST",
                headers: {
                  authorization:
                    "Bearer test-api-key",
                  "content-type":
                    "application/json",
                },
                body:
                  JSON.stringify(
                    body,
                  ),
              },
            );

          const json =
            await response.json();

          /*
           * This proves the request passed
           * T3N and reached the next security
           * boundary: the Solana signer.
           */
          assert.equal(
            response.status,
            503,
          );

          assert.equal(
            json.error?.code,
            "READ_ONLY_MODE",
          );
        },
      );
    } finally {
      if (
        oldApiKey ===
        undefined
      ) {
        delete process.env
          .SOLANA_AGENT_API_KEY;
      } else {
        process.env
          .SOLANA_AGENT_API_KEY =
          oldApiKey;
      }

      if (
        oldSigner ===
        undefined
      ) {
        delete process.env
          .AGENT_PRIVATE_KEY;
      } else {
        process.env
          .AGENT_PRIVATE_KEY =
          oldSigner;
      }
    }
  },
);

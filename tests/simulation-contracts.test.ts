import test from "node:test";
import assert from "node:assert/strict";
import {
  Connection,
  Keypair,
} from "@solana/web3.js";

import {
  executeLendingAction,
} from "../src/actions/lending.js";
import {
  openPerpPosition,
} from "../src/actions/perps.js";
import {
  createMultisigAccount,
} from "../src/actions/squads.js";
import {
  transferToken2022WithFee,
} from "../src/actions/token2022.js";

const connection = {} as Connection;
const payer = Keypair.generate();

test(
  "Simulation Contract - lending never exposes fake transaction signature",
  async () => {
    const result = await executeLendingAction(
      connection,
      payer,
      {
        protocol: "kamino",
        action: "deposit",
        asset: "SOL",
        amount: 1,
      },
    );

    assert.equal(result.success, true);
    assert.equal(
      result.executionMode,
      "simulation",
    );
    assert.ok(result.simulationId);
    assert.equal(
      "signature" in result,
      false,
    );
  },
);

test(
  "Simulation Contract - perps never exposes fake transaction signature",
  async () => {
    const result = await openPerpPosition(
      connection,
      payer,
      {
        market: "SOL-PERP",
        side: "long",
        leverage: 2,
        collateralAmount: 1,
      },
    );

    assert.equal(result.success, true);
    assert.equal(
      result.executionMode,
      "simulation",
    );
    assert.ok(result.simulationId);
    assert.equal(
      "signature" in result,
      false,
    );
  },
);

test(
  "Simulation Contract - Squads preview rejects invalid threshold",
  async () => {
    const result = await createMultisigAccount(
      connection,
      payer,
      {
        members: [
          payer.publicKey.toBase58(),
        ],
        threshold: 2,
      },
    );

    assert.equal(result.success, false);
    assert.equal(
      result.executionMode,
      "simulation",
    );
    assert.equal(
      result.error,
      "INVALID_THRESHOLD",
    );
  },
);

test(
  "Simulation Contract - Token2022 never exposes fake transaction signature",
  async () => {
    const result =
      await transferToken2022WithFee(
        connection,
        payer,
        {
          mint:
            "So11111111111111111111111111111111111111112",
          destination:
            payer.publicKey.toBase58(),
          amount: 1,
        },
      );

    assert.equal(result.success, true);
    assert.equal(
      result.executionMode,
      "simulation",
    );
    assert.ok(result.simulationId);
    assert.equal(
      "signature" in result,
      false,
    );
  },
);

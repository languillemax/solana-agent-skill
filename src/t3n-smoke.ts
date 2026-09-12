import dotenv from "dotenv";

import {
  getT3nLiveStatus,
} from "./t3n-live.js";

dotenv.config({
  quiet: true,
});

const status =
  await getT3nLiveStatus();

console.log(
  JSON.stringify(
    status,
    null,
    2,
  ),
);

if (!status.configured) {
  console.error(
    "\nT3N_API_KEY is not configured.",
  );

  process.exitCode = 2;
} else if (
  !status.authenticated
) {
  console.error(
    "\nT3N authentication failed.",
  );

  process.exitCode = 1;
}

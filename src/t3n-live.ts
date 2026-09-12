import {
  T3nClient,
  createEthAuthInput,
  eth_get_address,
  loadWasmComponent,
  metamask_sign,
  setEnvironment,
} from "@terminal3/t3n-sdk";

export type T3nEnvironment =
  | "sandbox"
  | "production";

export interface T3nLiveStatus {
  configured: boolean;
  authenticated: boolean;
  environment: T3nEnvironment;
  did?: string;
  address?: string;
  creditsAvailable?: unknown;
  error?: string;
}

function getT3nEnvironment(): T3nEnvironment {
  return process.env.T3N_ENV === "production"
    ? "production"
    : "sandbox";
}

function extractDid(
  authenticationResult: unknown,
): string | undefined {
  if (typeof authenticationResult === "string") {
    return authenticationResult;
  }

  if (
    typeof authenticationResult !== "object" ||
    authenticationResult === null
  ) {
    return undefined;
  }

  const result =
    authenticationResult as Record<
      string,
      unknown
    >;

  if (typeof result.did === "string") {
    return result.did;
  }

  if (typeof result.value === "string") {
    return result.value;
  }

  if (
    typeof result.value === "object" &&
    result.value !== null
  ) {
    const value = result.value as Record<
      string,
      unknown
    >;

    if (typeof value.did === "string") {
      return value.did;
    }

    if (typeof value.value === "string") {
      return value.value;
    }
  }

  return undefined;
}

/**
 * Opens a real authenticated Terminal 3 session.
 *
 * This function:
 * - loads the T3N WASM crypto component,
 * - performs the encrypted handshake,
 * - authenticates the developer key,
 * - reads the authenticated DID,
 * - reads the T3N credit balance.
 *
 * It never exposes T3N_API_KEY in its return value.
 */
export async function getT3nLiveStatus():
Promise<T3nLiveStatus> {
  const environment = getT3nEnvironment();

  const apiKey =
    process.env.T3N_API_KEY?.trim();

  if (!apiKey) {
    return {
      configured: false,
      authenticated: false,
      environment,
    };
  }

  try {
    setEnvironment(environment);

    const wasmComponent =
      await loadWasmComponent();

    const address =
      eth_get_address(apiKey);

    const trustAnchor = {
      unsafe_trust_server: true,
    } as const;

    const client = new T3nClient({
      wasmComponent,
      trustAnchor,
      handlers: {
        EthSign: metamask_sign(
          address,
          undefined,
          apiKey,
        ),
      },
    });

    await client.handshake();

    const authenticationResult =
      await client.authenticate(
        createEthAuthInput(address),
      );

    const usage =
      await client.getUsage();

    const did =
      extractDid(authenticationResult);

    if (!did) {
      throw new Error(
        "T3N authentication succeeded but no DID was returned",
      );
    }

    const usageObject =
      usage as unknown as {
        balance?: {
          available?: unknown;
        };
      };

    return {
      configured: true,
      authenticated: true,
      environment,
      did,
      address,
      creditsAvailable:
        usageObject.balance?.available,
    };
  } catch (error) {
    return {
      configured: true,
      authenticated: false,
      environment,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}

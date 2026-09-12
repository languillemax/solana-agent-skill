import {
  DEFAULT_RISK_CONFIG,
  SOLANA_AGENT_TOOLS,
  simulateTransaction,
  validateRiskLimits,
  type RiskConfig,
} from "./tools.js";

export interface T3NToolContext {
  connection?: unknown;
  wallet?: unknown;
  riskConfig?: Partial<RiskConfig>;
}

export interface T3NActionRequest {
  toolName: string;
  parameters: Record<string, unknown>;
  context?: T3NToolContext;
}

export interface T3NActionResponse {
  success: boolean;

  data?: {
    executionAuthorized: boolean;

    /**
     * This adapter currently performs logical validation only.
     * It is not Solana RPC simulation and not T3N TEE execution.
     */
    simulationMode: "logical";
    onchainSimulation: false;
    t3nAuthenticated: false;

    tool: string;
    parameters: Record<string, unknown>;
    logs: string[];
  };

  error?: {
    code: string;
    message: string;
  };
}

export class T3NAgentAdapter {
  private tools =
    new Map<
      string,
      {
        name: string;
        description: string;
        schema: any;
      }
    >();

  constructor() {
    SOLANA_AGENT_TOOLS.forEach(
      (tool) => {
        this.tools.set(
          tool.name,
          tool,
        );
      },
    );
  }

  public getAvailableTools() {
    return Array.from(
      this.tools.values(),
    ).map((tool) => ({
      name: tool.name,
      description: tool.description,
    }));
  }

  public async executeAction(
    request: T3NActionRequest,
  ): Promise<T3NActionResponse> {
    const tool =
      this.tools.get(
        request.toolName,
      );

    if (!tool) {
      return {
        success: false,
        error: {
          code: "UNKNOWN_TOOL",
          message:
            `Tool ${request.toolName} not supported`,
        },
      };
    }

    /*
     * 1. Deterministic schema guardrail.
     */
    const parsed =
      tool.schema.safeParse(
        request.parameters,
      );

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code:
            "INVALID_PARAMETERS",
          message:
            parsed.error
              .issues[0]
              ?.message ||
            "Invalid parameters",
        },
      };
    }

    /*
     * 2. Merge overrides with defaults.
     *
     * A partial config must never
     * silently remove a default limit.
     */
    const riskConfig: RiskConfig = {
      ...DEFAULT_RISK_CONFIG,
      ...(request.context
        ?.riskConfig ?? {}),
    };

    const riskCheck =
      validateRiskLimits(
        parsed.data,
        riskConfig,
      );

    if (!riskCheck.valid) {
      return {
        success: false,
        error: {
          code:
            riskCheck.code ||
            "RISK_REJECTED",
          message:
            riskCheck.message ||
            "Risk policy rejected action",
        },
      };
    }

    /*
     * 3. Logical compatibility gate.
     *
     * This is explicitly NOT:
     * - T3N TEE execution
     * - Solana RPC simulation
     */
    const simulation =
      await simulateTransaction(
        parsed.data,
      );

    if (!simulation.success) {
      return {
        success: false,
        error:
          simulation.error,
      };
    }

    return {
      success: true,
      data: {
        executionAuthorized: true,
        simulationMode:
          "logical",
        onchainSimulation:
          false,
        t3nAuthenticated:
          false,
        tool:
          request.toolName,
        parameters:
          parsed.data,
        logs:
          simulation.logs || [],
      },
    };
  }
}

export const t3nAdapter =
  new T3NAgentAdapter();

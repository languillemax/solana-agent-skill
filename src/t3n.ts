import { SOLANA_AGENT_TOOLS, validateRiskLimits, simulateTransaction, RiskConfig } from "./tools.js";

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
    simulated: boolean;
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
  private tools = new Map<string, { name: string; description: string; schema: any }>();

  constructor() {
    SOLANA_AGENT_TOOLS.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  public getAvailableTools() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description
    }));
  }

  public async executeAction(request: T3NActionRequest): Promise<T3NActionResponse> {
    const tool = this.tools.get(request.toolName);
    if (!tool) {
      return {
        success: false,
        error: { code: 'UNKNOWN_TOOL', message: `Tool ${request.toolName} not supported` }
      };
    }

    // 1. Zod Schema Guardrail
    const parsed = tool.schema.safeParse(request.parameters);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: 'INVALID_PARAMETERS', message: parsed.error.issues[0].message }
      };
    }

    // 2. Risk Guardrail
    const riskCheck = validateRiskLimits(parsed.data, request.context?.riskConfig as RiskConfig);
    if (!riskCheck.valid) {
      return {
        success: false,
        error: { code: riskCheck.code!, message: riskCheck.message! }
      };
    }

    // 3. Simulation Gate Execution
    const simResult = await simulateTransaction(parsed.data);
    if (!simResult.success) {
      return {
        success: false,
        error: simResult.error
      };
    }

    return {
      success: true,
      data: {
        executionAuthorized: true,
        simulated: true,
        tool: request.toolName,
        parameters: parsed.data,
        logs: simResult.logs || []
      }
    };
  }
}

export const t3nAdapter = new T3NAgentAdapter();

# Security Policy & Threat Model

## Threat Model & Risk Mitigation

### 1. LLM Hallucinations & Invalid Input
- **Risk**: A language model generates out-of-bounds parameters (negative values, excessive leverage, invalid addresses).
- **Mitigation**: Strict Zod schemas sanitize all incoming payloads prior to transaction building.

### 2. Simulation Gate
- **Risk**: Transactions with failing instructions or insufficient balance broadcasted to mainnet.
- **Mitigation**: Every transaction undergoes pre-execution RPC simulation. If simulation fails, execution halts before signing.

### 3. Key Management
- **Risk**: Private key exposure in codebase.
- **Mitigation**: Keys are loaded exclusively via environment variables (`SOLANA_PRIVATE_KEY`). Zero keys in source code.

### 4. Protocol Specific Limits
- **Max Leverage**: Hard-capped at 10x for Perps protocols.
- **Max Slippage**: Capped at 50% max to prevent sandwich attacks.

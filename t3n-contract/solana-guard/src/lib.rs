#[cfg(any(target_arch = "wasm32", test))]
use serde::{Deserialize, Serialize};

pub const CONTRACT_VERSION: &str = "0.1.0";

#[cfg(any(target_arch = "wasm32", test))]
const MAX_AMOUNT_SOL: f64 = 5.0;
#[cfg(any(target_arch = "wasm32", test))]
const MAX_SLIPPAGE_BPS: u16 = 100;

wit_bindgen::generate!({
    world: "solana-guard",
    path: "wit",
    additional_derives: [
        serde::Deserialize,
        serde::Serialize,
    ],
    generate_all,
});

#[cfg(any(target_arch = "wasm32", test))]
#[derive(Debug, Deserialize)]
struct SolanaActionRequest {
    action: String,
    amount_sol: f64,
    #[serde(default)]
    slippage_bps: Option<u16>,
    #[serde(default)]
    destination: Option<String>,
}

#[cfg(any(target_arch = "wasm32", test))]
#[derive(Debug, Serialize)]
struct AuthorizationResult {
    authorized: bool,
    action: String,
    reason: Option<String>,
    max_amount_sol: f64,
    max_slippage_bps: u16,
}

#[cfg(any(target_arch = "wasm32", test))]
fn deny(
    request: &SolanaActionRequest,
    reason: impl Into<String>,
) -> AuthorizationResult {
    AuthorizationResult {
        authorized: false,
        action: request.action.clone(),
        reason: Some(reason.into()),
        max_amount_sol: MAX_AMOUNT_SOL,
        max_slippage_bps: MAX_SLIPPAGE_BPS,
    }
}

#[cfg(any(target_arch = "wasm32", test))]
fn evaluate(
    request: &SolanaActionRequest,
) -> AuthorizationResult {
    if !matches!(
        request.action.as_str(),
        "SOL_TRANSFER" | "SWAP" | "PUMPFUN"
    ) {
        return deny(
            request,
            "action_not_allowed",
        );
    }

    if !request.amount_sol.is_finite()
        || request.amount_sol <= 0.0
    {
        return deny(
            request,
            "invalid_amount_sol",
        );
    }

    if request.amount_sol > MAX_AMOUNT_SOL {
        return deny(
            request,
            "amount_exceeds_limit",
        );
    }

    if matches!(
        request.action.as_str(),
        "SWAP" | "PUMPFUN"
    ) {
        let Some(slippage_bps) =
            request.slippage_bps
        else {
            return deny(
                request,
                "slippage_required",
            );
        };

        if slippage_bps > MAX_SLIPPAGE_BPS {
            return deny(
                request,
                "slippage_exceeds_limit",
            );
        }
    }

    if request.action == "SOL_TRANSFER" {
        let destination =
            request
                .destination
                .as_deref()
                .unwrap_or("")
                .trim();

        if destination.is_empty() {
            return deny(
                request,
                "destination_required",
            );
        }
    }

    AuthorizationResult {
        authorized: true,
        action: request.action.clone(),
        reason: None,
        max_amount_sol: MAX_AMOUNT_SOL,
        max_slippage_bps: MAX_SLIPPAGE_BPS,
    }
}

#[cfg(any(target_arch = "wasm32", test))]
fn authorize(
    input: &[u8],
) -> Result<Vec<u8>, String> {
    let request:
        SolanaActionRequest =
        serde_json::from_slice(input)
            .map_err(|_| {
                "invalid_json".to_string()
            })?;

    let result =
        evaluate(&request);

    serde_json::to_vec(&result)
        .map_err(|_| {
            "serialization_failed".to_string()
        })
}

#[cfg(target_arch = "wasm32")]
struct Component;

#[cfg(target_arch = "wasm32")]
impl exports::z::solana_guard::contracts::Guest
    for Component
{
    fn authorize_solana_action(
        req: exports::z::solana_guard::contracts::GenericInput,
    ) -> Result<Vec<u8>, String> {
        let input =
            req.input.ok_or(
                "authorize-solana-action: missing input",
            )?;

        authorize(&input)
    }
}

#[cfg(target_arch = "wasm32")]
export!(Component);

#[cfg(test)]
mod tests {
    use super::*;

    fn request(
        action: &str,
        amount_sol: f64,
        slippage_bps: Option<u16>,
        destination: Option<&str>,
    ) -> SolanaActionRequest {
        SolanaActionRequest {
            action: action.to_string(),
            amount_sol,
            slippage_bps,
            destination:
                destination.map(str::to_string),
        }
    }

    #[test]
    fn allows_safe_transfer() {
        let result =
            evaluate(&request(
                "SOL_TRANSFER",
                1.0,
                None,
                Some("recipient"),
            ));

        assert!(result.authorized);
    }

    #[test]
    fn rejects_large_amount() {
        let result =
            evaluate(&request(
                "SOL_TRANSFER",
                6.0,
                None,
                Some("recipient"),
            ));

        assert!(!result.authorized);
        assert_eq!(
            result.reason.as_deref(),
            Some("amount_exceeds_limit"),
        );
    }

    #[test]
    fn rejects_high_slippage() {
        let result =
            evaluate(&request(
                "SWAP",
                1.0,
                Some(101),
                None,
            ));

        assert!(!result.authorized);
    }

    #[test]
    fn authorize_parses_json() {
        let input = br#"{
            "action":"SWAP",
            "amount_sol":1.0,
            "slippage_bps":50
        }"#;

        let output =
            authorize(input).expect("authorization should serialize");

        let value: serde_json::Value =
            serde_json::from_slice(&output).unwrap();

        assert_eq!(
            value["authorized"],
            true,
        );

        assert_eq!(
            value["action"],
            "SWAP",
        );
    }

    #[test]
    fn rejects_unknown_action() {
        let result =
            evaluate(&request(
                "DRAIN_WALLET",
                1.0,
                None,
                None,
            ));

        assert!(!result.authorized);
    }
}

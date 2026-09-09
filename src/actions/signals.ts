export interface WebhookPayload {
  type: string;
  data: any;
}

export function parseSolanaWebhook(payload: WebhookPayload): { success: boolean; eventType: string; summary: string } {
  if (!payload || !payload.type) {
    return { success: false, eventType: "unknown", summary: "Payload invalide" };
  }
  return {
    success: true,
    eventType: payload.type,
    summary: `Événement ${payload.type} traité avec succès`
  };
}

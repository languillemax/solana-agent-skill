export interface BlinkActionParams {
  actionUrl: string;
  label: string;
  icon?: string;
  description?: string;
}

export function generateBlinkUrl(params: BlinkActionParams): { success: boolean; blinkUrl: string } {
  const encodedAction = encodeURIComponent(params.actionUrl);
  return {
    success: true,
    blinkUrl: `https://dial.to/devnet?action=solana-action:${encodedAction}`
  };
}

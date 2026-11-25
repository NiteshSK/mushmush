/** Window event that opens the "Ask Kosvana" chat panel. Any detail is ignored. */
export const OPEN_CHAT_EVENT = "kosvana:open-chat";

/**
 * Opens the chat panel from anywhere on the site, such as a footer or help link.
 * Focus returns to the element that had it when the shopper closes the chat.
 */
export function openChat(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT));
}

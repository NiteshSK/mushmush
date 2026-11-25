/** Window event that opens the "Ask Kosvana" chat panel. `detail.draft` may carry a question to pre-fill. */
export const OPEN_CHAT_EVENT = "kosvana:open-chat";

/** Longest draft the chat accepts from another page. */
export const MAX_CHAT_DRAFT = 200;

/**
 * Opens the chat panel from anywhere on the site, such as a footer or help link.
 * A draft is placed in the message box for the shopper to edit and send; it is never sent automatically.
 * Focus returns to the element that had it when the shopper closes the chat.
 */
export function openChat(draft?: string): void {
  if (typeof window === "undefined") return;
  const text = typeof draft === "string" ? draft.trim().slice(0, MAX_CHAT_DRAFT) : "";
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail: text ? { draft: text } : undefined }));
}

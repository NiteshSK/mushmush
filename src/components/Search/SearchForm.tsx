"use client";

import { type FormEvent, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { openChat } from "../AI/open-chat";
import styles from "./search.module.css";

function trimOrBlock(event: FormEvent<HTMLFormElement>) {
  const field = event.currentTarget.elements.namedItem("search") as HTMLInputElement;
  field.value = field.value.trim();
  if (!field.value) {
    event.preventDefault();
    field.reportValidity();
  }
}

/** The question placed in the chat box when the shopper asks about what they typed. */
export const askDraft = (term: string) => `I'm looking for ${term}`;

const shown = (term: string) => (term.length > 40 ? `${term.slice(0, 40)}…` : term);

/**
 * Product search with a second way in: asking Kosvana. Whatever the shopper has typed goes to the
 * chat as an editable draft, so they do not have to type it again. Nothing is sent automatically.
 */
export default function SearchForm({ id, query = "", className, autoFocus, onAsk = openChat }: {
  id: string;
  query?: string;
  className?: string;
  /** Put the cursor in the field, as the header search dialog does when it opens. */
  autoFocus?: boolean;
  /** Opens the chat with an optional draft. The header dialog closes itself first. */
  onAsk?: (draft?: string) => void;
}) {
  const [term, setTerm] = useState(query);
  const typed = term.trim();

  return <form action="/search" role="search" className={className} onSubmit={trimOrBlock}>
    <label htmlFor={id} className={styles.searchLabel}>Product or ingredient</label>
    <div className={styles.searchField}>
      <input id={id} autoFocus={autoFocus} type="search" name="search" required value={term} onChange={event => setTerm(event.target.value)}
        placeholder="Try walnuts or cumin" autoComplete="off" />
      <button type="submit">Search</button>
    </div>
    <button type="button" className={styles.ask} onClick={() => onAsk(typed ? askDraft(typed) : undefined)} aria-haspopup="dialog">
      <span className={styles.askIcon} aria-hidden="true"><MessageCircle /></span>
      <span className={styles.askText}>
        <strong>{typed ? <>Ask Kosvana about “{shown(typed)}”</> : "Not sure what to search for?"}</strong>
        <span>{typed ? "Get help choosing, or ask about delivery." : "Ask Kosvana about products, delivery or training."}</span>
      </span>
      <ArrowRight className={styles.askArrow} aria-hidden="true" />
    </button>
  </form>;
}

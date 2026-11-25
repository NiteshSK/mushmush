"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";
import pantry from "../Pantry/pantry.module.css";
import styles from "../Pantry/decide.module.css";

type Review = { id?: number; rating: number; comment?: string | null; createdAt: string; user?: { name?: string | null } | null };
type State = { status: "loading" } | { status: "error" } | { status: "ready"; reviews: Review[]; total: number; average: number };

const MAX_COMMENT = 250;
const date = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return <span className={styles.stars} role="img" aria-label={`Rated ${Math.round(rating * 10) / 10} out of 5`}>
    {Array.from({ length: 5 }, (_, i) => <Star key={i} width={size} height={size} aria-hidden="true" data-filled={i < Math.round(rating) || undefined} />)}
  </span>;
}

/** Existing product reviews from /api/reviews, with the signed-in review form. */
export default function Reviews({ productId, title, signIn }: { productId: number; title: string; signIn: string }) {
  const session = useSession();
  const signedIn = session?.status === "authenticated";
  const [state, setState] = useState<State>({ status: "loading" });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`, { signal });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      if (signal?.aborted) return;
      setState({ status: "ready", reviews: data.reviews ?? [], total: data.totalReviews ?? 0, average: data.averageRating ?? 0 });
    } catch {
      if (!signal?.aborted) setState({ status: "error" });
    }
  }, [productId]);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) { setMessage({ tone: "error", text: "Write a few words about the product." }); return; }
    setSending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: comment.trim() }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "We couldn’t post your review. Please try again.");
      }
      setComment("");
      setRating(5);
      setMessage({ tone: "ok", text: "Thank you. Your review is posted." });
      await load();
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "We couldn’t post your review. Please try again." });
    } finally {
      setSending(false);
    }
  }

  return <section id="reviews" className={styles.block} aria-labelledby="reviews-title">
    <h2 id="reviews-title">Reviews</h2>
    <div className={styles.reviews}>
      {state.status === "loading" ? <p className={styles.muted} role="status">Loading reviews…</p>
        : state.status === "error" ? <div role="alert">
          <p className={styles.muted}>Reviews couldn’t load.</p>
          <button type="button" className={pantry.textAction} onClick={() => { setState({ status: "loading" }); load(); }}>Try again</button>
        </div>
          : state.total > 0 ? <>
            <p className={styles.reviewSummary}><Stars rating={state.average} size={18} />
              <span>{state.average.toFixed(1)} out of 5 · {state.total} {state.total === 1 ? "review" : "reviews"}</span></p>
            <ol className={styles.reviewList}>
              {state.reviews.map((review, index) => <li key={review.id ?? index}>
                <p className={styles.reviewMeta}><Stars rating={review.rating} />
                  <strong>{review.user?.name || "A customer"}</strong>
                  <time dateTime={review.createdAt}>{date(review.createdAt)}</time></p>
                {review.comment && <p>{review.comment}</p>}
              </li>)}
            </ol>
          </> : <p className={styles.muted}>No reviews of {title} yet.</p>}

      {signedIn ? <form className={styles.reviewForm} onSubmit={submit}>
        <h3>Write a review</h3>
        <fieldset>
          <legend>Your rating</legend>
          <div className={styles.ratingChoices}>
            {[1, 2, 3, 4, 5].map(value => <label key={value} data-on={value <= rating || undefined}>
              <input type="radio" name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} />
              <Star aria-hidden="true" /><span className={pantry.srOnly}>{value} {value === 1 ? "star" : "stars"}</span>
            </label>)}
          </div>
        </fieldset>
        <label htmlFor="review-comment">Your review</label>
        <textarea id="review-comment" rows={4} maxLength={MAX_COMMENT} value={comment} onChange={event => setComment(event.target.value.slice(0, MAX_COMMENT))}
          aria-describedby="review-count" placeholder={`How did you use ${title}?`} />
        <div className={styles.formFoot}>
          <span id="review-count" className={styles.muted}>{comment.length}/{MAX_COMMENT}</span>
          <button className={styles.submit} disabled={sending}>{sending ? "Posting…" : "Post review"}</button>
        </div>
        {message && <p role={message.tone === "error" ? "alert" : "status"} className={styles.formMessage} data-tone={message.tone}>{message.text}</p>}
      </form> : session?.status !== "loading" && <p className={styles.signInNote}>
        <Link href={signIn} className={pantry.textAction}>Sign in</Link> to write a review.
      </p>}
    </div>
  </section>;
}

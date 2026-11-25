import type { ReactNode } from "react";
import styles from "../Pantry/auth.module.css";

type Props = {
  kicker: string;
  title: ReactNode;
  lede: ReactNode;
  /** Short reasons or next steps. Desktop shows them under the title; phones show them after the form. */
  notes?: ReactNode[];
  notesLabel?: string;
  children: ReactNode;
};

/** The page body for sign-in, sign-up and password recovery inside <PantryShell>. */
export default function AuthPage({ kicker, title, lede, notes, notesLabel, children }: Props) {
  return (
    <main id="main" className={styles.auth}>
      <div className={styles.intro}>
        <p className={styles.kicker}>{kicker}</p>
        <h1>{title}</h1>
        <p className={styles.lede}>{lede}</p>
      </div>
      <div className={styles.panel}>{children}</div>
      {notes && notes.length > 0 && (
        <ul className={styles.notes} aria-label={notesLabel}>
          {notes.map((note, index) => <li key={index}><span>{note}</span></li>)}
        </ul>
      )}
    </main>
  );
}

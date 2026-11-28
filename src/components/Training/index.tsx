"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import GrowSection from "./GrowSection";
import ProgrammeFacts from "./ProgrammeFacts";
import RegisterAction from "./RegisterAction";
import { loadListings, takesRegistrations, schedulePath, typeLabel, type Listing } from "./programme";
import pantry from "../Pantry/pantry.module.css";
import styles from "../Pantry/training.module.css";

// The loader lives in programme.ts so the homepage and search can use it without this page component.
export { loadListings, type Listing } from "./programme";
type State = { status: "loading" } | { status: "error" } | { status: "ready"; listings: Listing[] };

type Props = {
  /** Listings loaded on the server. Without them the page loads the listings in the browser. */
  initialListings?: Listing[];
  /** Server-rendered sections shown after the course list and before the grow supplies. */
  children?: ReactNode;
};

/** Training programmes: dates, availability, fees and the Register action first, then the description. */
export default function TrainingPrograms({ initialListings, children }: Props) {
  const [state, setState] = useState<State>(initialListings ? { status: "ready", listings: initialListings } : { status: "loading" });
  // Server data is already in the first render; load in the browser only without it (and on retry).
  const [loadOnMount] = useState(!initialListings);

  const load = useCallback(() => {
    let active = true;
    setState({ status: "loading" });
    loadListings()
      .then(listings => { if (active) setState({ status: "ready", listings }); })
      .catch(() => { if (active) setState({ status: "error" }); });
    return () => { active = false; };
  }, []);

  useEffect(() => (loadOnMount ? load() : undefined), [load, loadOnMount]);

  // Talk about registering and paying only while at least one course takes registrations.
  const anyOpen = state.status === "ready" && state.listings.some(({ batch }) => takesRegistrations(batch));

  return (
    <main id="main" className={pantry.page} aria-busy={state.status === "loading"}>
      <header className={pantry.pageHead}>
        <div>
          <p className={pantry.kicker}>Kosvana farm, Herbertpur</p>
          <h1>Mushroom <em>cultivation</em> training in Dehradun</h1>
        </div>
        <p className={styles.lede}>
          {anyOpen || state.status !== "ready"
            ? "Dates, fees and registration for each course. Register with your Kosvana account and pay by UPI."
            : "Dates, fees and details for each course. Ask us about the next batch."}
        </p>
      </header>

      {state.status === "loading" && (
        <div className={styles.programmes} aria-hidden="true">
          {[0, 1].map(key => <div key={key} className={styles.programmeSkeleton}><p /><p /><p /></div>)}
        </div>
      )}

      {state.status === "error" && (
        <div className={pantry.recovery} role="alert">
          <h2>We couldn’t load the training courses</h2>
          <p>Check your connection and try again.</p>
          <button type="button" className={pantry.primaryAction} onClick={load}>Try again</button>
        </div>
      )}

      {state.status === "ready" && state.listings.length === 0 && (
        <div className={pantry.recovery}>
          <h2>No training courses are open right now</h2>
          <p>Contact us to ask about the next course.</p>
          <Link href="/contact" className={pantry.primaryAction}>Contact Kosvana</Link>
        </div>
      )}

      {state.status === "ready" && state.listings.length > 0 && (
        <ul className={styles.programmes} aria-label="Training courses">
          {state.listings.map(({ program, batch, hours }) => (
            <li key={program.id}>
              <article className={styles.programme} aria-labelledby={`programme-${program.id}`}>
                <div className={styles.programmeHead}>
                  <p className={pantry.kicker}>{typeLabel(program.type)}</p>
                  <h2 id={`programme-${program.id}`}>
                    <Link href={schedulePath(program.slug)}>{program.name}</Link>
                  </h2>
                </div>
                <ProgrammeFacts program={program} batch={batch} hours={hours} />
                <div className={styles.programmeActions}>
                  <RegisterAction
                    program={program}
                    returnTo="/training"
                    open={takesRegistrations(batch)}
                  />
                  <Link href={schedulePath(program.slug)} className={pantry.textAction}>
                    Day-by-day schedule<span className={pantry.srOnly}> for {program.name}</span>
                  </Link>
                </div>
                <p className={styles.programmeSummary}>{program.description}</p>
              </article>
            </li>
          ))}
        </ul>
      )}

      {anyOpen && (
        <section className={styles.steps} aria-labelledby="training-steps">
          <h2 id="training-steps">How registration works</h2>
          <ol>
            <li><strong>Sign in</strong><span>Registration needs a Kosvana account.</span></li>
            <li><strong>Add participant details</strong><span>Name, contact details and address.</span></li>
            <li><strong>Pay by UPI</strong><span>Pay the fee and enter the UPI transaction ID.</span></li>
            <li><strong>Wait for verification</strong><span>Your registration stays pending until we verify the payment.</span></li>
          </ol>
        </section>
      )}

      {children}

      <GrowSection />
    </main>
  );
}

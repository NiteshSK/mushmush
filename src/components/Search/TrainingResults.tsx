import Link from "next/link";
import { batchStatus, formatFee, formatRange, hasUpcomingBatch, programmeFee, schedulePath, typeLabel, type Listing } from "../Training/programme";
import pantry from "../Pantry/pantry.module.css";
import styles from "./search.module.css";

/** The next batch in one line: dates while a batch is upcoming or running, otherwise what is known. */
function nextBatch({ batch }: Listing) {
  if (!("start" in batch) || batch.state === "past") return batchStatus(batch);
  const dates = formatRange(batch.start, batch.end);
  return hasUpcomingBatch(batch) ? dates : `${dates} · running now`;
}

/** Training courses that match a search, shown above the pantry products. */
export default function TrainingResults({ listings }: { listings: Listing[] }) {
  return <section className={styles.training} aria-labelledby="search-training">
    <div className={styles.trainingHead}>
      <div>
        <p className={pantry.kicker}>Kosvana training</p>
        <h2 id="search-training">Training</h2>
      </div>
      <Link href="/training" className={pantry.textAction}>All training courses</Link>
    </div>
    <ul className={styles.courses}>
      {listings.map(listing => {
        const { program } = listing;
        const fee = programmeFee(program);
        return <li key={program.id} className={styles.course}>
          <div className={styles.courseName}>
            <p className={pantry.kicker}>{typeLabel(program.type)}</p>
            <h3>{program.name}</h3>
            <p className={styles.courseMeta}>{program.duration} {program.duration === 1 ? "day" : "days"} · Herbertpur</p>
          </div>
          <dl className={styles.courseFacts}>
            <div>
              <dt>Next batch</dt>
              <dd>{nextBatch(listing)}</dd>
            </div>
            <div>
              <dt>Fee</dt>
              <dd>
                {formatFee(fee.amount)}
                {fee.regular != null && <s aria-label={`Regular fee ${formatFee(fee.regular)}`}>{formatFee(fee.regular)}</s>}
              </dd>
            </div>
          </dl>
          <Link href={schedulePath(program.slug)} className={pantry.textAction}>
            See dates and register<span className={pantry.srOnly}> for {program.name}</span>
          </Link>
        </li>;
      })}
    </ul>
  </section>;
}

import { batchStatus, formatDay, formatFee, formatRange, programmeFee, type Batch, type TrainingProgram } from "./programme";
import styles from "../Pantry/training.module.css";

type Props = {
  program: TrainingProgram;
  batch: Batch;
  /** Start and end time shared by every day, such as "09:00–17:00". */
  hours?: string | null;
};

/** Dates, availability, fee and length: the facts a shopper checks before registering. */
export default function ProgrammeFacts({ program, batch, hours }: Props) {
  const fee = programmeFee(program);
  const dailyHours = program.dailyHours.trim().replace(/\bhours?\b/i, word => word.toLowerCase());
  return (
    <dl className={styles.facts}>
      <div className={styles.factDates}>
        <dt>Dates</dt>
        <dd>
          <strong>{"start" in batch ? formatRange(batch.start, batch.end) : "Not announced"}</strong>
          <span className={styles.batchState} data-state={batch.state}>{batchStatus(batch)}</span>
        </dd>
      </div>
      <div>
        <dt>Fee</dt>
        <dd>
          <strong>{formatFee(fee.amount)}</strong>
          {fee.regular != null && <s aria-label={`Regular fee ${formatFee(fee.regular)}`}>{formatFee(fee.regular)}</s>}
          <span>per participant{fee.earlyBirdEnds ? `. Early-bird fee until ${formatDay(fee.earlyBirdEnds)}` : ""}</span>
        </dd>
      </div>
      <div>
        <dt>Length</dt>
        <dd>
          <strong>{program.duration} {program.duration === 1 ? "day" : "days"}</strong>
          <span>{hours ? `${hours} each day` : `Daily hours: ${dailyHours}`}</span>
        </dd>
      </div>
    </dl>
  );
}

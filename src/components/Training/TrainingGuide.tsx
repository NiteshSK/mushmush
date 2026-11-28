import Link from "next/link";
import { CONTACT } from "../Help/ContactOptions";
import {
  formatDay, formatFee, formatRange, listItems, programmeFee, schedulePath, sharedHours, takesRegistrations, toListing,
  type Course, type ScheduleDay,
} from "./programme";
import pantry from "../Pantry/pantry.module.css";
import styles from "../Pantry/training.module.css";

/**
 * What the training covers, who it is for, where it happens and common questions. Every answer
 * comes from the programmes and timetables in the database or from copy the site already
 * publishes (About, FAQs, contact details, the registration flow). Leave out accommodation,
 * meals, certificates, seat limits and refunds until the owner confirms them.
 */

const askHref = (name: string) => `/contact?subject=${encodeURIComponent(`Next batch: ${name}`)}`;

const hasSessions = (items: unknown) => Array.isArray(items) && items.some(item =>
  typeof item === "string" ? item.trim() !== "" : !!item && typeof item.title === "string" && item.title.trim() !== "");

/** "A, B and C" */
const joinNames = (names: string[]) =>
  names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

function dailyHours(course: Course) {
  const hours = course.days ? sharedHours(course.days) : null;
  return hours ? `${hours} each day` : `${course.program.dailyHours.trim().toLowerCase()} a day`;
}

function instructorsOf(courses: Course[]) {
  return courses.reduce<string[]>((names, { days }) => (days ?? []).reduce((all, day) =>
    day.instructor?.name && all.indexOf(day.instructor.name) < 0 ? all.concat(day.instructor.name) : all, names), []);
}

export default function TrainingGuide({ courses }: { courses: Course[] }) {
  const instructors = instructorsOf(courses);
  const listings = courses.map(course => toListing(course));
  const open = listings.filter(({ batch }) => takesRegistrations(batch));
  const closed = listings.filter(({ batch }) => !takesRegistrations(batch));

  return (
    <div className={styles.guide}>
      {courses.length > 0 && (
        <section className={styles.guideSection} aria-labelledby="learn-title">
          <div className={styles.guideHead}>
            <h2 id="learn-title">What you learn</h2>
            <p>The topics of each day, from the published timetable of each course.</p>
          </div>
          <div className={styles.learn}>
            {courses.map(course => <CourseTopics key={course.program.id} course={course} />)}
          </div>
        </section>
      )}

      <section className={styles.guideSection} aria-labelledby="audience-title">
        <div className={styles.guideHead}><h2 id="audience-title">Who it is for</h2></div>
        <div className={styles.guideCopy}>
          <p>The courses are for anyone who wants to grow mushrooms, from home growers to people who plan to start a farm.</p>
          {instructors.length > 0 && (
            <p>{joinNames(instructors)} teach the courses. They grow mushrooms full-time at the Kosvana farm in Herbertpur.</p>
          )}
        </div>
      </section>

      <section className={styles.guideSection} aria-labelledby="where-title">
        <div className={styles.guideHead}><h2 id="where-title">Where</h2></div>
        <div className={styles.guideCopy}>
          <p>The training centre is at the Kosvana farm in Herbertpur, Dehradun, Uttarakhand.</p>
          <address className={styles.guideAddress}>{CONTACT.name}<br />{CONTACT.address}</address>
          <a href={CONTACT.maps} className={pantry.textAction} target="_blank" rel="noopener noreferrer">
            Open in Google Maps<span className={pantry.srOnly}> (opens in a new tab)</span>
          </a>
        </div>
      </section>

      <section className={styles.guideSection} aria-labelledby="questions-title">
        <div className={styles.guideHead}><h2 id="questions-title">Common questions</h2></div>
        <div className={styles.questions}>
          {courses.length > 0 && (
            <div>
              <h3>How long is each course?</h3>
              <ul>
                {courses.map(course => (
                  <li key={course.program.id}>
                    {course.program.name}: {course.program.duration} {course.program.duration === 1 ? "day" : "days"}, {dailyHours(course)}.
                  </li>
                ))}
              </ul>
            </div>
          )}
          {courses.length > 0 && (
            <div>
              <h3>What is the fee?</h3>
              <ul>
                {courses.map(({ program }) => {
                  const fee = programmeFee(program);
                  return (
                    <li key={program.id}>
                      {program.name}: {formatFee(fee.amount)} per participant
                      {fee.earlyBirdEnds && fee.regular != null ? ` (early-bird fee until ${formatDay(fee.earlyBirdEnds)}; regular fee ${formatFee(fee.regular)})` : ""}.
                    </li>
                  );
                })}
              </ul>
              <p>You pay the fee by UPI after you register.</p>
            </div>
          )}
          <div>
            <h3>How do I register and pay?</h3>
            <p>You can register for a course while its batch has dates ahead. Then:</p>
            <ol>
              <li>Click Register on the course and sign in. Registration needs a Kosvana account.</li>
              <li>Add the participant’s name, email, phone number and address.</li>
              <li>Pay the fee by UPI and enter the UPI transaction ID.</li>
              <li>Your registration stays pending until we verify the payment.</li>
            </ol>
          </div>
          <div>
            <h3>When is the next batch?</h3>
            {open.length > 0 && (
              <ul>
                {open.map(({ program, batch }) => (
                  <li key={program.id}>
                    {program.name}: {"start" in batch ? formatRange(batch.start, batch.end) : ""}
                    {batch.state === "running" ? " (running now)" : ""}.
                  </li>
                ))}
              </ul>
            )}
            {closed.length > 0 && (
              <>
                <p>The next dates for {joinNames(closed.map(({ program }) => program.name))} are not set yet. Ask us, and we’ll tell you when they are.</p>
                <ul className={styles.questionLinks}>
                  {closed.map(({ program }) => (
                    <li key={program.id}>
                      <Link href={askHref(program.name)} className={pantry.textAction}>Ask about the next {program.name} batch</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {courses.length === 0 && <p><Link href="/contact" className={pantry.textAction}>Ask us about the next batch</Link></p>}
            <p>You can also message us on <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp<span className={pantry.srOnly}> (opens in a new tab)</span></a> or call <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneLabel}</a>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function CourseTopics({ course }: { course: Course }) {
  const { program, days } = course;
  const timetable: ScheduleDay[] = days ?? [];
  const handsOn = timetable.length > 0 && timetable.every(day => hasSessions(day.practicalSessions) && hasSessions(day.theoreticalSessions));
  return (
    <div className={styles.learnCourse}>
      <h3>{program.name}</h3>
      {handsOn && <p className={styles.learnNote}>Each day has theory sessions and practical sessions.</p>}
      {timetable.length > 0 ? (
        <ol className={styles.learnDays}>
          {timetable.map(day => {
            const topics = listItems(day.topics);
            return (
              <li key={day.id}>
                <span>Day {day.dayNumber}</span>
                <strong>{day.title}</strong>
                {topics.length > 0 && <p>{topics.join(", ")}</p>}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className={styles.learnNote}>{program.description}</p>
      )}
      <Link href={schedulePath(program.slug)} className={pantry.textAction}>
        Full schedule<span className={pantry.srOnly}> for {program.name}</span>
      </Link>
    </div>
  );
}

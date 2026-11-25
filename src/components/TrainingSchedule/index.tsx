"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import ProgrammeFacts from "@/components/Training/ProgrammeFacts";
import RegisterAction from "@/components/Training/RegisterAction";
import {
  batchOf, dayKey, formatDay, formatRange, listItems, schedulePath, sharedHours, takesRegistrations, typeLabel,
  type Batch, type ScheduleDay, type Session, type TrainingProgram,
} from "@/components/Training/programme";
import pantry from "../Pantry/pantry.module.css";
import styles from "../Pantry/training.module.css";

interface TrainingScheduleProps {
  programSlug: string;
}

type State =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error" }
  | { status: "ready"; program: TrainingProgram; days: ScheduleDay[] | null };

async function loadProgramme(slug: string): Promise<State> {
  const response = await fetch(`/api/training-programs/${encodeURIComponent(slug)}`);
  if (response.status === 404) return { status: "missing" };
  if (!response.ok) return { status: "error" };
  const program: TrainingProgram = await response.json();
  try {
    const schedule = await fetch(`/api/training-programs/${program.id}/schedule`);
    if (!schedule.ok) throw new Error();
    const days: ScheduleDay[] = await schedule.json();
    return { status: "ready", program, days: [...days].sort((a, b) => a.dayNumber - b.dayNumber) };
  } catch {
    return { status: "ready", program, days: null };
  }
}

function scheduleNote(batch: Batch) {
  if (!("start" in batch)) return null;
  const range = formatRange(batch.start, batch.end);
  if (batch.state === "past") return `This timetable is from the batch that ran ${range}.`;
  if (batch.state === "running") return `This batch runs ${range}.`;
  return `Next batch: ${range}.`;
}

/** One programme: dates, fee and registration first, then the description and the day-by-day timetable. */
export default function TrainingSchedule({ programSlug }: TrainingScheduleProps) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [open, setOpen] = useState<number[]>([]);

  const load = useCallback(() => {
    let active = true;
    setState({ status: "loading" });
    loadProgramme(programSlug)
      .then(next => { if (active) setState(next); })
      .catch(() => { if (active) setState({ status: "error" }); });
    return () => { active = false; };
  }, [programSlug]);

  useEffect(() => load(), [load]);

  const crumbs = (current?: string) => (
    <nav aria-label="Breadcrumb" className={styles.crumbs}>
      <ol>
        <li><Link href="/training">Training</Link></li>
        {current && <li aria-current="page">{current}</li>}
      </ol>
    </nav>
  );

  if (state.status === "loading") {
    return (
      <main id="main" className={pantry.page} aria-busy="true">
        {crumbs()}
        <div className={styles.programmeSkeleton} aria-hidden="true"><p /><p /><p /></div>
      </main>
    );
  }

  if (state.status === "missing" || state.status === "error") {
    const missing = state.status === "missing";
    return (
      <main id="main" className={pantry.page}>
        {crumbs()}
        <div className={`${pantry.recovery} ${styles.recoveryTitle}`} role={missing ? undefined : "alert"}>
          <h1>{missing ? "We couldn’t find this training course" : "We couldn’t load this training course"}</h1>
          <p>{missing ? "The link may be old, or the course may no longer run. See the courses that are open now." : "Check your connection and try again."}</p>
          {missing
            ? <Link href="/training" className={pantry.primaryAction}>See all training courses</Link>
            : <button type="button" className={pantry.primaryAction} onClick={load}>Try again</button>}
        </div>
      </main>
    );
  }

  const { program, days } = state;
  const batch = batchOf(days);
  const note = scheduleNote(batch);
  const allOpen = !!days && days.length > 0 && open.length === days.length;
  const toggle = (id: number) => setOpen(ids => ids.indexOf(id) >= 0 ? ids.filter(other => other !== id) : ids.concat(id));
  const instructors = (days ?? []).reduce<NonNullable<ScheduleDay["instructor"]>[]>((all, day) =>
    day.instructor && !all.some(person => person.id === day.instructor!.id) ? all.concat(day.instructor) : all, []);

  return (
    <main id="main" className={pantry.page}>
      {crumbs(program.name)}
      <div className={styles.detailTop}>
        <header className={styles.detailHead}>
          <p className={pantry.kicker}>{typeLabel(program.type)}</p>
          <h1>{program.name}</h1>
        </header>
        <section className={styles.booking} aria-label="Dates, fee and registration">
          <ProgrammeFacts program={program} batch={batch} hours={days ? sharedHours(days) : null} />
          <RegisterAction
            program={program}
            returnTo={schedulePath(program.slug)}
            open={takesRegistrations(batch)}
          />
        </section>
      </div>

      <section className={styles.about} aria-labelledby="about-title">
        <h2 id="about-title">About this course</h2>
        <p>{program.description}</p>
      </section>

      <section className={styles.schedule} aria-labelledby="schedule-title">
        <div className={styles.scheduleHead}>
          <div>
            <h2 id="schedule-title">Day-by-day schedule</h2>
            {note && <p>{note}</p>}
          </div>
          {days && days.length > 0 && (
            <button type="button" className={pantry.textAction} aria-expanded={allOpen}
              onClick={() => setOpen(allOpen ? [] : days.map(day => day.id))}>
              {allOpen ? "Hide all details" : "Show all details"}
            </button>
          )}
        </div>

        {days === null && (
          <div className={styles.inlineRecovery} role="alert">
            <p>We couldn’t load the timetable.</p>
            <button type="button" className={pantry.textAction} onClick={load}>Try again</button>
          </div>
        )}
        {days && days.length === 0 && <p className={styles.inlineRecovery}>The timetable for this course is not published yet.</p>}
        {days && days.length > 0 && (
          <ol className={styles.days}>
            {days.map(day => (
              <li key={day.id}>
                <Day day={day} expanded={open.indexOf(day.id) >= 0} onToggle={() => toggle(day.id)} />
              </li>
            ))}
          </ol>
        )}
      </section>

      {instructors.length > 0 && (
        <section className={styles.instructors} aria-labelledby="instructors-title">
          <h2 id="instructors-title">Instructors</h2>
          <ul>
            {instructors.map(person => (
              <li key={person.id}>
                <h3>{person.name}</h3>
                {person.bio && <p>{person.bio}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className={styles.backLink}><Link href="/training" className={pantry.textAction}>All training courses</Link></p>
    </main>
  );
}

function Day({ day, expanded, onToggle }: { day: ScheduleDay; expanded: boolean; onToggle: () => void }) {
  const panelId = `day-${day.id}-details`;
  const theory = sessions(day.theoreticalSessions);
  const practical = sessions(day.practicalSessions);
  const topics = listItems(day.topics);
  const objectives = listItems(day.learningObjectives);
  const materials = listItems(day.materials);
  const counts = [
    theory.length ? `${theory.length} theory ${theory.length === 1 ? "session" : "sessions"}` : "",
    practical.length ? `${practical.length} practical ${practical.length === 1 ? "session" : "sessions"}` : "",
  ].filter(Boolean).join(" · ");

  return (
    <article className={styles.day}>
      <p className={styles.dayDate}>
        <span>Day {day.dayNumber}</span>
        <strong>{formatDay(dayKey(day.date))}</strong>
      </p>
      <div className={styles.dayMain}>
        <h3>
          <button type="button" className={styles.dayToggle} aria-expanded={expanded} aria-controls={panelId} onClick={onToggle}>
            <span>{day.title}</span>
            <ChevronDown aria-hidden="true" />
          </button>
        </h3>
        <p className={styles.dayMeta}>
          <span>{day.startTime}–{day.endTime}</span>
          {day.instructor?.name && <span>{day.instructor.name}</span>}
          {counts && <span>{counts}</span>}
        </p>
        <div id={panelId} className={styles.dayDetails} hidden={!expanded}>
          {day.description && <p className={styles.dayDescription}>{day.description}</p>}
          <div className={styles.sessionGrid}>
            <SessionList title="Theory" items={theory} />
            <SessionList title="Practical" items={practical} />
          </div>
          <div className={styles.listGrid}>
            <TextList title="Topics" items={topics} />
            <TextList title="Learning objectives" items={objectives} />
            <TextList title="Materials" items={materials} />
          </div>
        </div>
      </div>
    </article>
  );
}

function sessions(items: unknown): Session[] {
  if (!Array.isArray(items)) return [];
  return items
    .map(item => typeof item === "string" ? { title: item } : item)
    .filter((item): item is Session => !!item && typeof item.title === "string" && item.title.trim() !== "");
}

function SessionList({ title, items }: { title: string; items: Session[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4>{title}</h4>
      <ul className={styles.sessions}>
        {items.map((session, index) => (
          <li key={index}>
            <p><strong>{session.title}</strong>{session.duration && <span>{session.duration}</span>}</p>
            {session.description && <p>{session.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TextList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4>{title}</h4>
      <ul className={styles.textList}>
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
}

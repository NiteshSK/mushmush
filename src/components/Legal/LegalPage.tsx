import type { ReactNode } from "react";
import p from "../Pantry/pantry.module.css";
import l from "../Pantry/legal.module.css";
import { formatLegalDate, LAST_UPDATED } from "./legal-facts";

export type LegalSection = { id: string; title: string; body: ReactNode };

type Props = {
  title: ReactNode;
  lead: ReactNode;
  sections: LegalSection[];
};

/** Shared frame for /terms and /privacy: title, last-updated date, contents list and a reading column. */
export default function LegalPage({ title, lead, sections }: Props) {
  return (
    <main id="main" className={`${p.page} ${l.legal}`}>
      <header className={l.head}>
        <p className={p.kicker}>Kosvana policies</p>
        <div className={p.pageHead}><h1>{title}</h1></div>
        <p className={l.lead}>{lead}</p>
        <p className={l.updated}>Last updated <time dateTime={LAST_UPDATED}>{formatLegalDate(LAST_UPDATED)}</time></p>
      </header>
      <div className={l.layout}>
        <nav className={l.toc} aria-labelledby="legal-contents">
          <h2 id="legal-contents">Contents</h2>
          <ol>
            {sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}
          </ol>
        </nav>
        <article className={l.article}>
          {sections.map(section => (
            <section key={section.id} id={section.id} className={l.section} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.body}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}

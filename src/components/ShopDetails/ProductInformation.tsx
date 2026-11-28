"use client";

import type { ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { trackVisitAction } from "@/lib/visit-analytics";
import { descriptionHtml, productIntro, productSections, readableHtml } from "./content";
import styles from "../Pantry/decide.module.css";

type Sections = ReturnType<typeof productSections>;

export const ABOUT_ID = "about";

// Every stored string goes through readableHtml (the shared sanitiser) before it reaches the page.
const Rich = ({ html, as: Tag = "div" }: { html: string; as?: "div" | "li" }) =>
  <Tag className={Tag === "div" ? styles.rich : undefined} dangerouslySetInnerHTML={{ __html: readableHtml(html) }} />;

function CopyList({ items }: { items: string[] }) {
  if (items.length === 1) return <Rich html={items[0]} />;
  return <ul className={styles.rich}>{items.map((item, i) => <Rich key={i} html={item} as="li" />)}</ul>;
}

function Topic({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section className={styles.topic} aria-labelledby={id}>
    <h3 id={id}>{title}</h3>
    {children}
  </section>;
}

export const hasProductCopy = (sections: Sections) => Boolean(sections.description || sections.benefits.length || sections.preparation.length
  || sections.specifications.length || sections.details.length || sections.storage.length);

/** The first sentence of the description beside the price, with a link down to the full product information. */
export function ProductSummary({ sections }: { sections: Sections }) {
  if (!hasProductCopy(sections)) return null;
  const intro = productIntro(sections.description);
  return <div className={styles.introBlock}>
    {intro && <p className={styles.intro}>{intro}</p>}
    <a href={`#${ABOUT_ID}`} className={styles.introLink} onClick={() => trackVisitAction("product_info", "overview")}>
      Product details<ArrowDown aria-hidden="true" />
    </a>
  </div>;
}

/**
 * All the stored product copy as visible, headed text below the purchase area, so shoppers and search engines
 * read it in the first HTML. A topic without stored copy is left out.
 */
export default function ProductAbout({ title, sections }: { title: string; sections: Sections }) {
  if (!hasProductCopy(sections)) return null;
  return <section id={ABOUT_ID} className={styles.block} aria-labelledby="about-title">
    <h2 id="about-title">{`About ${title}`}</h2>
    <div className={styles.aboutBody}>
      {sections.description && <div className={styles.rich} dangerouslySetInnerHTML={{ __html: descriptionHtml(sections.description) }} />}
      {sections.benefits.length > 0 && <Topic id="about-benefits" title="Benefits">
        <dl className={styles.rows}>
          {sections.benefits.map((benefit, i) => <div key={i}>
            {benefit.label ? <dt>{benefit.label}</dt> : null}
            <dd>{benefit.text}</dd>
          </div>)}
        </dl>
      </Topic>}
      {sections.preparation.length > 0 && <Topic id="about-use" title="How to use">
        <CopyList items={sections.preparation} />
      </Topic>}
      {(sections.specifications.length > 0 || sections.details.length > 0) && <Topic id="about-specifications" title="Specifications">
        {sections.specifications.length > 0 && <CopyList items={sections.specifications} />}
        {sections.details.length > 0 && <dl className={styles.rows}>
          {sections.details.map((row, i) => <div key={i}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}
        </dl>}
      </Topic>}
      {sections.storage.length > 0 && <Topic id="about-storage" title="Storage">
        <CopyList items={sections.storage} />
      </Topic>}
    </div>
  </section>;
}

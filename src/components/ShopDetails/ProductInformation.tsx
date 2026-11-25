"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import { trackVisitAction } from "@/lib/visit-analytics";
import { productIntro, productSections } from "./content";
import styles from "../Pantry/decide.module.css";

type Sections = ReturnType<typeof productSections>;
const labels = { overview: "Overview", care: "Use & storage" };
type Tab = keyof typeof labels;

const Rich = ({ html, as: Tag = "div" }: { html: string; as?: "div" | "li" }) =>
  <Tag className={Tag === "div" ? styles.rich : undefined} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;

function CopyList({ items }: { items: string[] }) {
  if (items.length === 1) return <Rich html={items[0]} />;
  return <ul className={styles.rich}>{items.map((item, i) => <Rich key={i} html={item} as="li" />)}</ul>;
}

function Overview({ sections }: { sections: Sections }) {
  return <>
    {sections.description && <Rich html={sections.description} />}
    {(sections.specifications.length > 0 || sections.details.length > 0) && <section className={styles.informationSection}>
      <h3>Specifications</h3>
      {sections.specifications.length > 0 && <CopyList items={sections.specifications} />}
      {sections.details.length > 0 && <dl className={styles.rows}>
        {sections.details.map((row, i) => <div key={i}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}
      </dl>}
    </section>}
    {sections.benefits.length > 0 && <section className={styles.informationSection}>
      <h3>Benefits</h3>
      <dl className={styles.rows}>
        {sections.benefits.map((benefit, i) => <div key={i}>
          {benefit.label ? <dt>{benefit.label}</dt> : null}
          <dd>{benefit.text}</dd>
        </div>)}
      </dl>
    </section>}
  </>;
}

function UseAndStorage({ sections }: { sections: Sections }) {
  return <>
    {sections.storage.length > 0 && <section className={styles.informationSection}>
      <h3>Storage</h3>
      <CopyList items={sections.storage} />
    </section>}
    {sections.preparation.length > 0 && <section className={styles.informationSection}>
      <h3>How to use</h3>
      <CopyList items={sections.preparation} />
    </section>}
  </>;
}

function InformationDialog({ title, sections, tabs, initialTab, trigger, onClose }: {
  title: string;
  sections: Sections;
  tabs: Tab[];
  initialTab: Tab;
  trigger: HTMLButtonElement;
  onClose: () => void;
}) {
  const [active, setActive] = useState(initialTab);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = dialog.current;
    const previous = document.body.style.overflow;
    element?.showModal();
    closeButton.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previous;
      if (trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [trigger]);

  function selectTab(tab: Tab) {
    if (tab !== active) trackVisitAction("product_info", tab);
    setActive(tab);
    if (content.current) content.current.scrollTop = 0;
  }

  function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.indexOf(active);
    const next = event.key === "Home" ? tabs[0]
      : event.key === "End" ? tabs[tabs.length - 1]
        : event.key === "ArrowRight" ? tabs[(index + 1) % tabs.length]
          : event.key === "ArrowLeft" ? tabs[(index + tabs.length - 1) % tabs.length] : undefined;
    if (next) {
      event.preventDefault();
      selectTab(next);
      dialog.current?.querySelector<HTMLButtonElement>(`#product-info-tab-${next}`)?.focus();
    }
  }

  return <dialog ref={dialog} className={styles.informationDialog} aria-labelledby="product-info-title"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.informationSheet}>
      <div className={styles.informationHead}>
        <h2 id="product-info-title">{title}</h2>
        <button ref={closeButton} type="button" className={styles.informationClose} aria-label="Close product details" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </div>
      {tabs.length > 1 && <div className={styles.informationTabs} role="tablist" aria-label="Product information" onKeyDown={onTabKey}>
        {tabs.map(tab => <button key={tab} type="button" role="tab" id={`product-info-tab-${tab}`}
          aria-controls={`product-info-content-${tab}`} aria-selected={active === tab} tabIndex={active === tab ? 0 : -1}
          onClick={() => selectTab(tab)}>
          {labels[tab]}
        </button>)}
      </div>}
      <div ref={content} className={styles.informationContent}>
        {tabs.map(tab => <div key={tab} id={`product-info-content-${tab}`} hidden={active !== tab}
          role={tabs.length > 1 ? "tabpanel" : undefined} aria-labelledby={tabs.length > 1 ? `product-info-tab-${tab}` : undefined}
          tabIndex={active === tab ? 0 : undefined}>
          {tab === "overview" ? <Overview sections={sections} /> : <UseAndStorage sections={sections} />}
        </div>)}
      </div>
    </div>
  </dialog>;
}

export default function ProductInformation({ title, sections }: { title: string; sections: Sections }) {
  const [open, setOpen] = useState<{ tab: Tab; trigger: HTMLButtonElement } | null>(null);
  const intro = productIntro(sections.description);
  const hasOverview = Boolean(sections.description || sections.specifications.length || sections.details.length || sections.benefits.length);
  const hasUse = sections.preparation.length > 0;
  const hasStorage = sections.storage.length > 0;
  const tabs: Tab[] = [];
  if (hasOverview) tabs.push("overview");
  if (hasUse || hasStorage) tabs.push("care");
  if (!tabs.length) return null;

  return <div className={styles.introBlock}>
    {intro && <p className={styles.intro}>{intro}</p>}
    <div className={styles.informationActions}>
      {tabs.map(tab => <button key={tab} type="button" aria-haspopup="dialog" onClick={event => {
        trackVisitAction("product_info", tab);
        setOpen({ tab, trigger: event.currentTarget });
      }}>
        {tab === "overview" ? "Product details" : hasUse && hasStorage ? labels.care : hasUse ? "How to use" : "Storage"}
        <ArrowUpRight aria-hidden="true" />
      </button>)}
    </div>
    {open && <InformationDialog title={title} sections={sections} tabs={tabs} initialTab={open.tab} trigger={open.trigger} onClose={() => setOpen(null)} />}
  </div>;
}

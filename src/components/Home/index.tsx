"use client";

import Link from "next/link";
import PantryShell, { useOpenPanel } from "@/components/Pantry/PantryShell";
import styles from "../Pantry/pantry.module.css";
import PantryShelf from "./PantryShelf";
import GrowBand from "./GrowBand";

export default function Home() {
  return (
    <PantryShell skipTo={{ href: "#pantry", label: "Skip to the pantry" }} browseHref="#pantry">
      <HomeMain />
    </PantryShell>
  );
}

function HomeMain() {
  const openPanel = useOpenPanel();
  return (
    <main>
      <section className={styles.hero} aria-labelledby="pantry-title">
        <picture>
          <source media="(max-width: 640px)" srcSet="/images/pantry/himalayan-pantry-mobile.webp" />
          <img src="/images/pantry/himalayan-pantry.webp" width="1983" height="793" alt="" loading="eager" />
        </picture>
        <div className={styles.heroFrame} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.origin}><span aria-hidden="true" />Herbertpur, Uttarakhand</p>
          <h1 id="pantry-title">The Himalayan{" "}<br /><em>Pantry.</em></h1>
          <p className={styles.intro}>Dried mushrooms, whole spices and fine dry fruits.<br className={styles.desktopBreak} /> From our home in the foothills to kitchens across India.</p>
          <a href="#pantry" className={styles.heroButton}>Shop the pantry</a>
        </div>
      </section>

      <PantryShelf />

      <GrowBand />

      <section className={styles.farm} aria-labelledby="farm-title">
        <div className={styles.farmCopy}>
          <p className={styles.kicker}>Herbertpur, Dehradun</p>
          <h2 id="farm-title">Grown by hand,<br /><em>in the foothills.</em></h2>
          <p className={styles.farmLead}>Three friends left their jobs to grow mushrooms in Herbertpur. They still look after every stage themselves, from the first straw bed to the last harvest.</p>
          <ul className={styles.farmWays}>
            <li><span>We grow</span><p>Fresh mushrooms for kitchens in Dehradun.</p></li>
            <li><span>We pack</span><p>Dried mushrooms, spices, dry fruits and seeds for homes across India.</p></li>
            <li><span>We teach</span><p>Five-day courses for anyone who wants to grow mushrooms. <Link href="/training">See the courses</Link></p></li>
          </ul>
          <div className={styles.farmLinks}>
            <Link href="/about-us" className={styles.farmPrimary}>Meet the growers</Link>
            <button className={styles.farmSecondary} onClick={() => openPanel("delivery")}>Check fresh delivery</button>
          </div>
        </div>
      </section>
    </main>
  );
}

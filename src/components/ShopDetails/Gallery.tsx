"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { trackVisitAction } from "@/lib/visit-analytics";
import styles from "../Pantry/decide.module.css";

type Props = { images: string[]; title: string };

/** Swipeable product photos: a scroll-snap track with real thumbnail buttons. */
export default function Gallery({ images, title }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const photos = images.filter(src => !failed[src]);
  const count = photos.length;
  const lastPhoto = useRef(0);

  useEffect(() => {
    if (active === lastPhoto.current) return;
    const settled = window.setTimeout(() => {
      lastPhoto.current = active;
      trackVisitAction("gallery", String(active + 1));
    }, 250);
    return () => window.clearTimeout(settled);
  }, [active]);

  function show(index: number) {
    setActive(index);
    const element = track.current;
    if (!element) return;
    const smooth = typeof window.matchMedia === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof element.scrollTo === "function") element.scrollTo({ left: index * element.clientWidth, behavior: smooth ? "smooth" : "auto" });
  }

  function onScroll() {
    const element = track.current;
    if (!element || !element.clientWidth) return;
    const index = Math.round(element.scrollLeft / element.clientWidth);
    if (index !== active && index >= 0 && index < count) setActive(index);
  }

  if (!count) return <div className={styles.gallery}><div className={styles.noPhoto} role="img" aria-label={`No photo of ${title} yet`} /></div>;

  return <div className={styles.gallery}>
    <div ref={track} className={styles.track} onScroll={onScroll} tabIndex={count > 1 ? 0 : undefined}
      role="region" aria-label={count > 1 ? `Photos of ${title}. Swipe or use the arrow keys to see more.` : `Photo of ${title}`}>
      {photos.map((src, index) => <figure key={src} className={styles.slide}>
        <Image src={src} alt={index === 0 ? title : `${title}, photo ${index + 1}`} fill priority={index === 0}
          sizes="(max-width: 759px) 100vw, 55vw" onError={() => setFailed(previous => ({ ...previous, [src]: true }))} />
      </figure>)}
    </div>
    {count > 1 && <>
      <p className={styles.photoCount} aria-hidden="true">{active + 1} / {count}</p>
      <div className={styles.thumbs} role="group" aria-label="Choose a photo">
        {photos.map((src, index) => <button key={src} type="button" onClick={() => show(index)} aria-pressed={index === active}
          aria-label={`Show photo ${index + 1} of ${count}`}>
          <Image src={src} alt="" fill sizes="72px" />
        </button>)}
      </div>
    </>}
  </div>;
}

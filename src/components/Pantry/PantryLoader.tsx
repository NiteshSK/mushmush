import styles from "./loader.module.css";

type Props = {
  /** Words under the mark. Screen readers hear them through role="status". */
  label?: string;
  size?: number;
  /** "inline" sits in the flow; "full" fills the content area; "screen" covers the window. */
  variant?: "inline" | "full" | "screen";
};

/** Kosvana loader: a forest-green mushroom whose cap grows while spores rise. */
export default function PantryLoader({ label = "Opening the pantry…", size = 64, variant = "full" }: Props) {
  return <div role="status" aria-live="polite" className={`${styles.loader} ${variant === "full" ? styles.full : variant === "screen" ? styles.screen : ""}`}>
    <svg className={styles.mark} style={{ ["--size" as string]: `${size}px` }} viewBox="0 0 64 76" aria-hidden="true" focusable="false">
      <circle className={styles.spore} cx="22" cy="14" r="1.8" fill="#c9a861" />
      <circle className={styles.spore} cx="32" cy="8" r="1.8" fill="#c9a861" />
      <circle className={styles.spore} cx="42" cy="14" r="1.8" fill="#c9a861" />
      <g className={styles.cap}>
        <path d="M8 46c0-13 10.7-22 24-22s24 9 24 22c0 2-1.6 3-3.5 3h-41C9.6 49 8 48 8 46z" fill="#1c3024" />
        <circle cx="21" cy="38" r="2.4" fill="#fff8e9" opacity=".9" />
        <circle cx="33" cy="32" r="2" fill="#fff8e9" opacity=".9" />
        <circle cx="44" cy="40" r="1.7" fill="#fff8e9" opacity=".9" />
      </g>
      <path d="M25 49h14l2 16a3 3 0 0 1-3 3.4H26a3 3 0 0 1-3-3.4z" fill="#fff8e9" stroke="#1c3024" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 70h40" stroke="#d7d4c6" strokeWidth="2" strokeLinecap="round" />
    </svg>
    <span className={styles.label}>{label}</span>
  </div>;
}

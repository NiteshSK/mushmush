import Link from "next/link";
import { COLLECTIONS, collectionPath } from "./collections";
import styles from "../Pantry/pantry.module.css";

/**
 * Text links to every shop collection and to the whole shop. `current` marks the page the shopper is on.
 * The label is not a heading, so the product names stay the only h2s in the listing.
 */
export default function CollectionLinks({ current }: { current?: string }) {
  const links = [...COLLECTIONS.map(collection => ({ href: collectionPath(collection), name: collection.name, slug: collection.slug })),
    { href: "/shop", name: "All products", slug: "all" }];
  return <nav aria-label="Browse by collection" className={styles.collectionNav}>
    <p className={styles.collectionNavLabel} aria-hidden="true">Browse by collection</p>
    <ul>
      {links.map(link => <li key={link.slug}>
        <Link href={link.href} aria-current={link.slug === current ? "page" : undefined}>{link.name}</Link>
      </li>)}
    </ul>
  </nav>;
}

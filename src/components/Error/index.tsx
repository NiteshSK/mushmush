import Link from "next/link";
import p from "../Pantry/pantry.module.css";
import h from "../Pantry/help.module.css";

/** Recovery page: search the pantry, browse the shop or contact Kosvana. */
export default function ErrorRecovery() {
  return (
    <main id="main" className={`${p.page} ${h.help} ${h.fill}`}>
      <div className={h.notice}>
        <p className={p.kicker}>Error</p>
        <h1>This page isn’t <em>available.</em></h1>
        <p>The link may be old, or the page may have moved. Search for a product, browse the shop or contact us.</p>
      </div>
      <form action="/search" role="search" className={p.searchForm}>
        <label htmlFor="error-search">Search the pantry</label>
        <div className={p.field}>
          <input id="error-search" type="search" name="search" required placeholder="Try walnuts or cumin" />
          <button type="submit">Search</button>
        </div>
      </form>
      <div className={h.headActions}>
        <Link href="/shop" className={p.textAction}>Browse the shop</Link>
        <Link href="/contact" className={p.textAction}>Contact us</Link>
        <Link href="/" className={p.textAction}>Go to the homepage</Link>
      </div>
    </main>
  );
}

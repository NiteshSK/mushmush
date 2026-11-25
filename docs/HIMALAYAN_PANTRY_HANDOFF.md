# Kosvana · The Himalayan Pantry

## Start here

Kosvana is a Himalayan food shop based in Herbertpur, Dehradun. Its pantry serves shoppers across India. The owner chose the **forest-green Himalayan Pantry homepage** as the visual direction for the customer-facing site. The goal is an affordable purchase that feels considered. A ₹149 pack of cumin deserves the same care in presentation as a more expensive mushroom.

**Owner feedback takes precedence over the screenshot.** The owner specifically disliked the “Our roots / It began on a mushroom farm” section. Exclude the large working-farm photograph, the half-photo/half-green composition, its headline and paired links from the rollout. The working homepage still contains this block. Use the existing “Our story” link for people who want the brand history. A future homepage cleanup can run the shelf directly into the footer. The preferred replacement, if any, is an open design decision.

Use the opening view for the brand and the shelf for shopping behavior. The mountain hero belongs on the homepage. Inner pages should open with what someone came to do, such as choosing a product, checking its pack size, or reviewing a bag.

| Visual reference | Desktop | Phone |
| --- | --- | --- |
| Masthead and hero | [Opening view](../audits/2026-11-22/screenshots/himalayan-pantry-desktop-viewport.jpg) | [Portrait composition](../audits/2026-11-22/screenshots/himalayan-pantry-mobile-viewport.jpg) |
| Filters, photography, prices and Add controls | [Desktop shelf](../audits/2026-11-22/screenshots/handoff-pantry-shelf-desktop.jpg) | [Two-column shelf](../audits/2026-11-22/screenshots/handoff-pantry-shelf-mobile.jpg) |

The companion ZIP includes these four views, the brief and the homepage source and approved design assets. Use it alongside the existing Mushmush checkout. Implementation links below resolve from the repository’s `docs/` directory.

## A first assignment to give Codex

> Implement the Himalayan Pantry design on `/shop` and `/search` in the existing Kosvana app. Read this handoff and inspect the current homepage first. Reuse the pantry header, typography and product-card behavior. Keep real catalogue data, URL filters, product links and the existing bag working. Exclude the rejected “Our roots” block. Show desktop and phone screenshots and verify that a shopper can filter, add a pack, refresh, and find it in the bag. Use the rollout below for subsequent pages.

## Visual decisions

| Element | Production reference | How to carry it forward |
| --- | --- | --- |
| Base palette | Forest `#263F31`, paper `#FAF8F1`, ink `#22382C` | Use paper behind products and forms, ink for reading, forest for primary actions. |
| Accents | Brass `#77603D`, pale gold `#E6CA90`, rules `#D7D4C6` | Use brass sparingly on paper. Reserve pale gold for detail on dark surfaces. Give prices and delivery information strong contrast. |
| Type | Self-hosted Cormorant Garamond 500, roman and italic. Euclid Circular A for interface text. | Set product names and page titles in serif. Use sans for ₹ amounts, pack sizes, inputs, statuses and buttons. A short italic phrase is enough for a display heading. |
| Header | Centered Kosvana signature, forest delivery strip, sticky ivory surface at 93% opacity with 18px blur | Desktop has Shop and Our story on the left, search and bag on the right. Phone has menu, signature, search and bag. Use glass on the masthead and dialog backdrop. Keep reading and payment surfaces opaque. |
| Space and controls | Desktop gutter `clamp(1rem, 5vw, 6rem)`. Mobile header change at 640px. Homepage grid uses two columns through 850px and four above. | Keep clear gutters, fine rules and restrained rectangular actions. Let filters wrap and controls grow at narrow widths. Aim for 44px touch targets. |
| Images | Wide and portrait mountain still lifes for the homepage, actual catalogue imagery for merchandise | Use editorial photography for atmosphere. Show shoppers the actual ingredient or pack they can buy. Keep label, price and weight out of the image so they stay legible. |
| Voice | “Shop the pantry”, “Add”, “Check delivery”, “250 g · ₹449” | Name the product, action or location directly. Use organic certification, sourcing details and verification badges only when supported for that specific product or claim. |

Exact CSS, including hover, focus and small-screen rules, lives in the [homepage stylesheet](../src/components/Home/pantry.module.css). Use the [existing wordmark](../public/images/logo/logo_meow.png) and [local display fonts](../public/fonts/cormorant/).

## Delivery determines what shoppers can buy

| What is in the bag | What the shopper should see |
| --- | --- |
| Dried mushrooms, spices, dry fruits, seeds and other shelf-stable foods | “Ships across India.” Let people browse and add immediately. Use their actual PIN for serviceability, fees and timing when those details are needed. |
| Fresh mushrooms | “Fresh mushrooms · Dehradun only.” Place the PIN check beside the purchase action. If the address is ineligible, offer dried mushrooms as a way to continue shopping. |
| Both fresh and shelf-stable items | Identify the exact fresh line affected by the address. Let the shopper change the address or remove that line, keeping the other items and quantities. |

The existing homepage calls `/api/shipping/check`. It confirms fresh delivery for `248001` and `248142` when the service returns “Local Dehradun”. It refers other PINs in that broad zone to the farm. **The full list of eligible fresh-delivery PINs still needs confirmation.** The catalogue also has ambiguous mushroom forms. Obtain product-level fulfillment data and an authoritative local delivery boundary before promising fresh eligibility throughout checkout. Treat server-side order enforcement as separate fulfillment work. [Homepage PIN logic](../src/components/Home/PantryDialog.tsx) · [Shipping service](../src/app/api/shipping/check/route.ts)

## Rollout by shopper task

| Order | Pages | What to build and verify |
| --- | --- | --- |
| 1. Browse | `/shop`, `/search?search=cumin` | Put products near the top. Use one category selector, one sort control and a visible way to clear filters. Search retains the query and offers recovery for zero results. Verify multi-category URLs on refresh and Back. The image and title open details. Add changes to a quantity control in place. |
| 2. Decide | `/shop-details/[slug]`, existing `/shop-details` entry | Put the product image, name, pack weight, ₹ price, availability, delivery scope and Add action together. Put preparation and storage below. On phones, keep the price and Add within reach and the gallery usable by touch. Preserve reviews and stock notifications where supported. |
| 3. Review and pay | Bag drawer, `/cart`, `/checkout` | Show each pack, quantity, price and delivery constraint. Update quantities and totals together. Give one primary action per step. Preserve guest checkout, email OTP, address selection and the existing UPI flow. Show fees before payment, distinguish pending payment from confirmed payment, and give an empty bag a return-to-shop action. |
| 4. Return | `/wishlist`, `/recently-viewed`, `/account`, `/my-account`, `/addresses`, `/orders`, sign-in/up and password recovery | Reuse product cards for saved items. Use compact lists for orders and addresses. Keep edit, track and retry actions close to the relevant item. Verify sign-in return URLs and bag continuity. |
| 5. Learn and get help | `/about-us`, `/faqs`, `/contact`, `/mail-success`, `/error` | Give each page one clear purpose. Tell the Herbertpur story on About using verified facts. Put delivery answers and contact options within reach. A success message should name the completed action and give a useful next link. |
| 6. Read or register | Blog and news indexes, article routes and sidebar variants, `/training`, program details and schedules | Use the same masthead and readable serif titles. Give articles a comfortable reading column. Put actual dates, availability, fees and registration actions first on training pages. Check older URLs for template copy or broken navigation before sending shoppers there. |

The rollout covers the public storefront and customer account surfaces. Admin, setup and diagnostic screens serve a separate operational audience.

## Implementation notes for this repository

- **Start from the running app.** The Next.js homepage at `/` is the reference. The earlier colour studies in the audit folder are historical concepts. The current shell belongs to [Home](../src/components/Home/index.tsx). The [site layout](../src/app/%28site%29/layout.tsx) bypasses the legacy header, banner, footer and top padding only on `/`. The [root client layout](../src/components/ClientRootLayout.tsx) handles persistence and also branches on the homepage. Extract the reusable shell and tokens for migrated routes. Check for double headers, excess top padding, missing modal providers and bag-count hydration on reload.
- **Share the shopping controls, keep each page’s data.** The live `/shop` uses [Shop](../src/components/Shop/index.tsx). Its outer clickable wrapper can intercept card actions. Give navigation to the product link and bag changes to a sibling button. Reuse the card and stepper from the pantry shelf, while letting Shop own filters, pagination and sort. The four house picks and title-based mushroom grouping are homepage merchandising choices.
- **Keep deep links useful.** Search submits the `search` query parameter. Products resolve through their real slug. In the homepage delivery dialog, “Browse the pantry” points to `#pantry`. Adapt that destination on other routes to `/#pantry` or a relevant shop listing. [Search results](../src/components/Search/SearchResults.tsx) · [Product detail](../src/components/ShopDetails/index.tsx)
- **Use one bag.** Use the existing Redux cart and persistence for cards, drawer, bag and checkout. New lines should carry product identity and stock limits. Resolve missing slugs and pack metadata for older saved bags. Keep ₹ values, quantities and line totals consistent across views. [Cart reducer](../src/redux/features/cart-slice.ts) · [Cart page](../src/components/Cart/index.tsx) · [Checkout](../src/components/Checkout/CheckoutWithOTP.tsx)
- **Verify commercial behavior before launch.** The earlier audit flagged order totals derived from request amounts and a broad delivery zone. Verify authoritative server prices and fresh-product eligibility before launch. Pricing, inventory, authentication and payment behavior require their own verification if touched. [Storefront audit](../audits/2026-11-22/index.html)

## What to return for each batch

1. Before/after screenshots of a representative desktop and phone journey, with filenames and routes. Include a populated state and one useful recovery state.
2. Results at 320px, 390px, 768px and 1440px. Check for horizontal overflow, clipped labels, obscured buttons and illegible prices. On keyboard, open a dialog, use it, close it with Escape, and verify focus returns to its trigger.
3. A recorded shopping check. Search for cumin, open the correct pack, add two, go back, refresh, reduce to one, and reach checkout. Confirm the slug, quantity, ₹ total and stock cap throughout. Exercise sold-out, empty and failed-load states with fixtures when needed.
4. Delivery examples for a local fresh purchase, a national pantry purchase and a mixed bag outside Dehradun. Distinguish what the interface communicates from what the server enforces. Exercise OTP and UPI using test data and a test payment environment.
5. List changed routes, focused test results and unresolved business decisions. For the first batch, compare the revised pages to the [homepage interaction tests](../src/components/Home/index.test.tsx). The repository build script includes a database migration, so use an appropriate test environment for build verification.

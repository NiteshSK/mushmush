import { act, render, screen, within } from "@testing-library/react";
import { ArticleMissing, JournalArticle, NewsArticle } from "../Article";

jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));

const fetchMock = global.fetch as jest.Mock;
beforeEach(() => {
  jest.useFakeTimers();
  fetchMock.mockResolvedValue({ ok: true });
  sessionStorage.clear();
});
afterEach(() => jest.useRealTimers());

const post = {
  slug: "unlock-the-umami", title: "Unlock the Umami: Growing Shiitake at Home", excerpt: "A guide to shiitake.",
  img: "/images/blog/unlock_the_umami.png", createdAt: new Date("2025-09-20T22:34:22.441Z"),
  content: `<style>body{color:red}</style><h2>Benefits</h2><p onclick="alert(1)">Rich in flavour.</p><script>alert(2)</script><a href="javascript:alert(3)">x</a><ul><li>Step one</li></ul>`,
};

describe("journal article", () => {
  it("shows the title, real date and sanitised body in one reading column, with no invented author", () => {
    const { container } = render(<JournalArticle post={post} topic="shiitake" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(post.title);
    expect(screen.getByText("21 September 2025").tagName).toBe("TIME");
    expect(screen.getByText("A guide to shiitake.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Benefits" })).toBeInTheDocument();
    expect(screen.getByText("Step one")).toBeInTheDocument();
    // Sanitising still removes scripts, styles, handlers and javascript: links.
    expect(container.querySelector("script, style, [onclick], [href^='javascript']")).toBeNull();
    expect(screen.queryByText(/Kosvana Team|Mushroom Experts|Views|Share|Popular Tags/)).toBeNull();
    expect(screen.getByRole("link", { name: "Journal" })).toHaveAttribute("href", "/blogs");
  });

  it("ends with a product search the catalogue can answer, or the shop", () => {
    const { unmount } = render(<JournalArticle post={post} topic="shiitake" />);
    expect(screen.getByRole("link", { name: "Search the pantry for shiitake" })).toHaveAttribute("href", "/search?search=shiitake");
    expect(screen.getByRole("link", { name: "More from the journal" })).toHaveAttribute("href", "/blogs");
    unmount();
    render(<JournalArticle post={post} topic={null} />);
    expect(screen.getByRole("link", { name: "Shop the pantry" })).toHaveAttribute("href", "/shop");
  });

  it("counts one view", () => {
    render(<JournalArticle post={post} topic={null} />);
    act(() => { jest.advanceTimersByTime(150); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/blog/unlock-the-umami/views", expect.objectContaining({ method: "POST" }));
  });
});

describe("news article", () => {
  const scraped = {
    slug: "turkey-tail", title: "Potential Benefits of Turkey Tail Mushroom - Verywell Health", excerpt: "Potential Benefits of Turkey Tail Mushroom  Verywell Health",
    img: "https://images.unsplash.com/photo-1", createdAt: new Date("2026-11-19T08:00:00.000Z"), source: "scraped",
    sourceUrl: "https://news.google.com/rss/articles/abc",
    content: `<p>This article from a leading news source provides the latest insights.</p>`,
  };

  it("credits the publisher and links out instead of showing generated filler or a stock photo", () => {
    render(<NewsArticle item={scraped} topic={null} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Potential Benefits of Turkey Tail Mushroom");
    expect(screen.queryByText(/leading news source/)).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
    const out = screen.getByRole("link", { name: /Read it at Verywell Health/ });
    expect(out).toHaveAttribute("href", scraped.sourceUrl);
    expect(out).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "More news" })).toHaveAttribute("href", "/news");
  });

  it("counts a news view once per session", () => {
    const { unmount } = render(<NewsArticle item={scraped} topic={null} />);
    act(() => { jest.advanceTimersByTime(150); });
    unmount();
    render(<NewsArticle item={scraped} topic={null} />);
    act(() => { jest.advanceTimersByTime(150); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/news/turkey-tail/increment-view", expect.objectContaining({ method: "POST" }));
  });

  it("renders admin-written news like an article", () => {
    const manual = { ...scraped, source: "manual", sourceUrl: null, title: "Harvest update - week 3", excerpt: "Our first flush.", content: "<p>Fresh oyster mushrooms this week.</p>", img: "" };
    render(<NewsArticle item={manual} topic="oyster" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Harvest update - week 3");
    expect(screen.getByText("Fresh oyster mushrooms this week.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Search the pantry for oyster" })).toHaveAttribute("href", "/search?search=oyster");
  });
});

it("offers a way back when an article is missing", () => {
  render(<ArticleMissing kind="journal" />);
  const main = screen.getByRole("main");
  expect(within(main).getByRole("heading", { level: 1 })).toHaveTextContent("We can’t find that article.");
  expect(within(main).getByRole("link", { name: "See all articles" })).toHaveAttribute("href", "/blogs");
});

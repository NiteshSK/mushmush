import { render, screen, within } from "@testing-library/react";
import { listNews, listPosts } from "../data";
import { ListLoading, NewsList, PostList } from "../Listing";

jest.mock("../data", () => ({ listPosts: jest.fn(), listNews: jest.fn() }));
// The shared jest setup drops every Link prop except href; keep aria attributes and classes here.
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));

const posts = jest.mocked(listPosts);
const news = jest.mocked(listNews);
const post = (id: number, extra = {}) => ({
  id, slug: `post-${id}`, title: `Growing oyster mushrooms ${id}`, excerpt: `Excerpt ${id}`, img: "/images/blog/oyster.png",
  createdAt: new Date("2025-09-02T04:51:23.347Z"), ...extra,
});

beforeEach(() => jest.spyOn(console, "error").mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

describe("journal index", () => {
  it("lists real posts with their dates, each card one link to the article", async () => {
    posts.mockResolvedValue({ posts: [post(1), post(2, { img: "", excerpt: null })], total: 2 });
    render(await PostList({ page: 1 }));
    const links = screen.getAllByRole("link");
    expect(links.map(link => link.getAttribute("href"))).toEqual(["/blogs/post-1", "/blogs/post-2"]);
    expect(within(links[0]).getByRole("heading", { level: 2 })).toHaveTextContent("Growing oyster mushrooms 1");
    expect(within(links[0]).getByText("2 September 2025")).toHaveAttribute("datetime", "2025-09-02T04:51:23.347Z");
    // No placeholder image or excerpt for a post that has none.
    expect(within(links[1]).queryByRole("img")).toBeNull();
    expect(within(links[1]).queryByText(/Excerpt/)).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByText(/views/i)).toBeNull();
  });

  it("paginates with real links when there is more than one page", async () => {
    posts.mockResolvedValue({ posts: [post(7)], total: 7 });
    render(await PostList({ page: 2 }));
    const nav = screen.getByRole("navigation", { name: "The journal pages" });
    expect(within(nav).getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/blogs");
    expect(within(nav).getByRole("link", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).queryByRole("link", { name: "Next" })).toBeNull();
  });

  it("offers the shop when there are no posts", async () => {
    posts.mockResolvedValue({ posts: [], total: 0 });
    render(await PostList({ page: 1 }));
    expect(screen.getByRole("heading", { name: "No articles yet." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop the pantry" })).toHaveAttribute("href", "/shop");
  });

  it("recovers from a page past the end", async () => {
    posts.mockResolvedValue({ posts: [], total: 2 });
    render(await PostList({ page: 9 }));
    expect(screen.getByRole("heading", { name: "There is no page 9." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to the first page" })).toHaveAttribute("href", "/blogs");
  });

  it("shows a retry when the database cannot be read", async () => {
    posts.mockRejectedValue(new Error("database down"));
    render(await PostList({ page: 2 }));
    expect(screen.getByRole("alert")).toHaveTextContent("The journal couldn’t load.");
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/blogs?page=2");
  });
});

describe("news index", () => {
  const scraped = {
    id: 1, slug: "turkey-tail", title: "Potential Benefits of Turkey Tail Mushroom - Verywell Health",
    excerpt: "Potential Benefits of Turkey Tail Mushroom  Verywell Health", createdAt: new Date("2026-11-19T08:00:00.000Z"),
    source: "scraped", sourceUrl: "https://news.google.com/rss/articles/abc",
  };
  const manual = { id: 2, slug: "farm-update", title: "Harvest update - week 3", excerpt: "Our first shiitake flush.", createdAt: new Date("2026-11-01T08:00:00.000Z"), source: "manual", sourceUrl: null };

  it("credits the publisher and opens scraped headlines on their site", async () => {
    news.mockResolvedValue({ news: [scraped, manual], total: 2 });
    render(await NewsList({ page: 1 }));
    const [external, internal] = screen.getAllByRole("link");
    expect(external).toHaveAttribute("href", scraped.sourceUrl);
    expect(external).toHaveAttribute("target", "_blank");
    expect(external).toHaveAttribute("rel", "noopener noreferrer");
    expect(external).toHaveAccessibleName(/Potential Benefits of Turkey Tail Mushroom.*opens Verywell Health in a new tab/);
    expect(within(external).getByText("Verywell Health")).toBeInTheDocument();
    expect(within(external).getByText("19 November 2026")).toBeInTheDocument();
    // The scraped excerpt only repeats the headline, so it is left out.
    expect(within(external).getAllByText(/Turkey Tail/)).toHaveLength(1);
    // Admin-written news stays on the site and keeps its whole title and excerpt.
    expect(internal).toHaveAttribute("href", "/news/farm-update");
    expect(within(internal).getByRole("heading")).toHaveTextContent("Harvest update - week 3");
    expect(within(internal).getByText("Our first shiitake flush.")).toBeInTheDocument();
  });

  it("points to the journal when there is no news", async () => {
    news.mockResolvedValue({ news: [], total: 0 });
    render(await NewsList({ page: 1 }));
    expect(screen.getByRole("link", { name: "Read the journal" })).toHaveAttribute("href", "/blogs");
  });

  it("shows a retry when the database cannot be read", async () => {
    news.mockRejectedValue(new Error("database down"));
    render(await NewsList({ page: 1 }));
    expect(screen.getByRole("alert")).toHaveTextContent("The news couldn’t load.");
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/news");
  });
});

it("announces loading while a page of articles streams in", () => {
  render(<ListLoading kind="journal" />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading articles…");
  expect(screen.getByRole("status").parentElement).toHaveAttribute("aria-busy", "true");
});

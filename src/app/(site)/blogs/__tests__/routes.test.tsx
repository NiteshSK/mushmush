import { notFound, redirect } from "next/navigation";
import { isPantryRoute } from "@/components/Pantry/routes";
import { findNewsItem, findPost, relatedSearch } from "@/components/Read/data";
import BlogGrid from "../blog-grid/page";
import BlogGridWithSidebar from "../blog-grid-with-sidebar/page";
import BlogDetails from "../blog-details/page";
import BlogDetailsWithSidebar from "../blog-details-with-sidebar/page";
import NewsWithSidebar from "../../news/with-sidebar/page";
import JournalArticlePage from "../[slug]/page";
import NewsArticlePage from "../../news/[slug]/page";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  notFound: jest.fn(() => { throw new Error("NEXT_NOT_FOUND"); }),
  useRouter: () => ({ refresh: jest.fn() }),
}));
jest.mock("@/components/Read/data", () => ({ findPost: jest.fn(), findNewsItem: jest.fn(), relatedSearch: jest.fn() }));
jest.mock("@/components/Pantry/PantryShell", () => ({ __esModule: true, default: () => null }));

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("blog and news routes", () => {
  it("send old template URLs to the real indexes", () => {
    for (const Page of [BlogGrid, BlogGridWithSidebar, BlogDetails, BlogDetailsWithSidebar]) Page();
    NewsWithSidebar();
    expect(jest.mocked(redirect).mock.calls).toEqual([["/blogs"], ["/blogs"], ["/blogs"], ["/blogs"], ["/news"]]);
  });

  it("render in the pantry shell", () => {
    for (const path of ["/blogs", "/blogs/unlock-the-umami", "/blogs/blog-grid", "/news", "/news/some-story", "/news/with-sidebar"]) {
      expect(isPantryRoute(path)).toBe(true);
    }
    expect(isPantryRoute("/blogsx")).toBe(false);
  });

  it("treat a missing or unpublished article as not found", async () => {
    jest.mocked(findPost).mockResolvedValue(null);
    await expect(JournalArticlePage(params("draft"))).rejects.toThrow("NEXT_NOT_FOUND");
    jest.mocked(findNewsItem).mockResolvedValue(null);
    await expect(NewsArticlePage(params("gone"))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(2);
  });

  it("let a database failure reach the error boundary instead of posing as not found", async () => {
    jest.mocked(findPost).mockRejectedValue(new Error("database down"));
    await expect(JournalArticlePage(params("unlock-the-umami"))).rejects.toThrow("database down");
    expect(notFound).not.toHaveBeenCalled();
  });

  it("look up a related product search only for journal articles and admin-written news", async () => {
    const date = new Date("2025-09-20T00:00:00Z");
    jest.mocked(findPost).mockResolvedValue({ id: 1, slug: "s", title: "Growing Shiitake", content: "", excerpt: null, img: "", views: 0, published: true, createdAt: date, updatedAt: date, metaTitle: null, metaDescription: null });
    jest.mocked(relatedSearch).mockResolvedValue("shiitake");
    await JournalArticlePage(params("s"));
    expect(relatedSearch).toHaveBeenCalledWith("Growing Shiitake");
    jest.mocked(relatedSearch).mockClear();
    jest.mocked(findNewsItem).mockResolvedValue({ id: 2, slug: "n", title: "Oyster study - Example News", content: "", excerpt: null, img: "", views: 0, published: true, createdAt: date, updatedAt: date, metaTitle: null, metaDescription: null, sourceUrl: "https://example.com", source: "scraped" });
    await NewsArticlePage(params("n"));
    expect(relatedSearch).not.toHaveBeenCalled();
  });
});

/** @jest-environment node */
import { NextRequest } from "next/server";
import { prisma } from "../prisma";
import { editorialList, publishStory } from "../editorial-admin";

jest.mock("../admin", () => ({ staffSession: jest.fn(async () => ({ user: { id: "editor-1" } })) }));
jest.mock("../prisma", () => ({
  prisma: {
    blogPost: { findMany: jest.fn(), count: jest.fn() },
    news: { findMany: jest.fn(), count: jest.fn(), updateMany: jest.fn() },
    staffEvent: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

test("journal search and sorting reach the database beyond the first page", async () => {
  jest.mocked(prisma.blogPost.findMany).mockResolvedValue([]);
  jest.mocked(prisma.blogPost.count).mockResolvedValue(51);
  const response = await editorialList(
    new NextRequest(
      "http://localhost/api/admin/blogs?q=shiitake&page=3&status=draft&sort=title&direction=asc",
    ),
    "blogs",
  );
  expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      skip: 50,
      take: 25,
      where: expect.objectContaining({
        published: false,
        OR: [
          { title: { contains: "shiitake", mode: "insensitive" } },
          { excerpt: { contains: "shiitake", mode: "insensitive" } },
        ],
      }),
      orderBy: [{ title: "asc" }, { id: "desc" }],
    }),
  );
  expect((await response.json()).pagination.totalPages).toBe(3);
});

test("publication updates only its flag and writes an event only for the accepted version", async () => {
  const date = "2026-11-25T10:00:00Z";
  const req = () =>
    new NextRequest("http://localhost/api/admin/news/9", {
      method: "PATCH",
      body: JSON.stringify({ published: true, expectedUpdatedAt: date }),
    });
  jest.mocked(prisma.$transaction).mockImplementation(async (callback: any) => callback(prisma));
  jest.mocked(prisma.news.updateMany).mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
  expect((await publishStory(req(), 9, "news")).status).toBe(200);
  expect(prisma.news.updateMany).toHaveBeenCalledWith({
    where: { id: 9, updatedAt: new Date(date) },
    data: { published: true },
  });
  expect((await publishStory(req(), 9, "news")).status).toBe(409);
  expect(prisma.staffEvent.create).toHaveBeenCalledTimes(1);
});

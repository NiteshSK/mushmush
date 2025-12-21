/**
 * @jest-environment node
 */
import { GET } from './route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
    prisma: {
        news: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
    },
}));

describe('News API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch news with default pagination', async () => {
        const mockNews = [
            { id: 1, title: 'News 1', slug: 'news-1' },
            { id: 2, title: 'News 2', slug: 'news-2' },
        ];
        const mockTotal = 2;

        (prisma.news.findMany as jest.Mock).mockResolvedValue(mockNews);
        (prisma.news.count as jest.Mock).mockResolvedValue(mockTotal);

        const req = new NextRequest('http://localhost:3000/api/news');
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.news).toEqual(mockNews);
        expect(data.pagination).toEqual({
            page: 1,
            limit: 10,
            total: 2,
            pages: 1,
        });

        expect(prisma.news.findMany).toHaveBeenCalledWith(expect.objectContaining({
            skip: 0,
            take: 10,
            where: { published: true },
        }));
    });

    it('should handle pagination parameters', async () => {
        const mockNews = [{ id: 3, title: 'News 3', slug: 'news-3' }];
        const mockTotal = 15;

        (prisma.news.findMany as jest.Mock).mockResolvedValue(mockNews);
        (prisma.news.count as jest.Mock).mockResolvedValue(mockTotal);

        const req = new NextRequest('http://localhost:3000/api/news?page=2&limit=5');
        const res = await GET(req);
        const data = await res.json();

        expect(data.pagination).toEqual({
            page: 2,
            limit: 5,
            total: 15,
            pages: 3,
        });

        expect(prisma.news.findMany).toHaveBeenCalledWith(expect.objectContaining({
            skip: 5,
            take: 5,
        }));
    });

    it('should handle database errors gracefully', async () => {
        (prisma.news.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

        const req = new NextRequest('http://localhost:3000/api/news');
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.error).toBe('Failed to fetch news');
    });
});

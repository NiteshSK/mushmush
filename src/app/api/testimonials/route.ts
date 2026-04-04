import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/testimonials — Fetch recent high-rated reviews to display as testimonials
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        rating: { gte: 4 },
        comment: { not: null },
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const testimonials = reviews
      .filter((r) => r.comment && r.comment.length >= 20)
      .map((r) => ({
        id: r.id,
        review: r.comment!,
        rating: r.rating,
        authorName: r.user?.name || "Kosvana Customer",
        authorImg: r.user?.image || "/images/users/user-01.jpg",
        authorRole: `Verified Buyer — ${r.product.title}`,
      }));

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ testimonials: [] });
  }
}

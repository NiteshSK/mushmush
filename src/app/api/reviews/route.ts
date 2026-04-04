import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/reviews?productId=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: parseInt(productId)
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews,
      totalReviews: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10 // Round to 1 decimal
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Submit a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Product ID and rating (1-5) are required" },
        { status: 400 }
      );
    }

    if (comment && comment.length > 2000) {
      return NextResponse.json(
        { error: "Review comment must be under 2000 characters" },
        { status: 400 }
      );
    }

    // First, ensure the user exists in the database
    const user = await prisma.user.upsert({
      where: { email: session.user.email! },
      update: {
        name: session.user.name,
        image: session.user.image,
      },
      create: {
        email: session.user.email!,
        name: session.user.name,
        image: session.user.image,
      }
    });

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: parseInt(productId),
        userId: user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId: parseInt(productId),
        userId: user.id,
        rating: parseInt(rating),
        ...(comment && { comment: comment })
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('P2002')) {
        return NextResponse.json(
          { error: "You have already reviewed this product" },
          { status: 400 }
        );
      }
      if (error.message.includes('P2003')) {
        return NextResponse.json(
          { error: "Invalid product or user reference" },
          { status: 400 }
        );
      }
      if (error.message.includes('P2025')) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to create review", details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined },
      { status: 500 }
    );
  }
}

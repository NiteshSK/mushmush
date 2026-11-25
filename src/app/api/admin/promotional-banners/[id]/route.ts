import { validBanner } from "@/lib/promotion-schedule";
import { NextRequest, NextResponse } from 'next/server';
import { staffSession } from "@/lib/admin";
import { prisma } from '@/lib/prisma';

async function checkAdminAuth() {
  const session = await staffSession("editor");
  if (!session?.user) {
    return false;
  }
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const bannerId = parseInt(id);
    if (isNaN(bannerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID' },
        { status: 400 }
      );
    }

    const banner = await prisma.promotionalBanner.findUnique({
      where: { id: bannerId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            inStock: true
          }
        },
        category: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: banner
    });

  } catch (error) {
    console.error('Error fetching promotional banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promotional banner' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const bannerId = parseInt(id);
    if (isNaN(bannerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const {
      title,
      subtitle,
      description,
      discount,
      buttonText,
      buttonLink,
      productId,
      categoryId,
      imageUrl,
      bgColor,
      textColor,
      isActive,
      startDate,
      endDate,
      priority
    } = body;

    const error = validBanner(body);
    if (error) return NextResponse.json({success:false,error},{status:400});

    const banner = await prisma.promotionalBanner.update({
      where: { id: bannerId },
      data: {
        title,
        subtitle,
        description,
        discount,
        buttonText,
        buttonLink,
        productId: productId ? parseInt(productId) : null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        imageUrl,
        bgColor,
        textColor,
        isActive,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        priority: priority !== undefined ? parseInt(priority) : undefined
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        category: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: banner
    });

  } catch (error) {
    console.error('Error updating promotional banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update promotional banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const bannerId = parseInt(id);
    if (isNaN(bannerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID' },
        { status: 400 }
      );
    }

    await prisma.promotionalBanner.delete({
      where: { id: bannerId }
    });

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting promotional banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete promotional banner' },
      { status: 500 }
    );
  }
}

export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  if (!(await staffSession("editor"))) return NextResponse.json({error:"Editor access required"},{status:403});
  const {isActive,expectedUpdatedAt} = await request.json();
  const version=new Date(expectedUpdatedAt);
  const id=Number((await params).id);
  if(!Number.isSafeInteger(id) || typeof isActive!=="boolean" || !expectedUpdatedAt || !Number.isFinite(version.getTime())) return NextResponse.json({error:"Invalid banner version or state."},{status:400});
  const changed = await prisma.promotionalBanner.updateMany({where:{id,updatedAt:version},data:{isActive}});
  return changed.count ? NextResponse.json({success:true}) : NextResponse.json({error:"Another editor changed this promotion. Reload before updating it."},{status:409});
}

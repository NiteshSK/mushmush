import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { staffSession } from "@/lib/admin";

// Helper function to check if user is admin
async function isAdmin() {
  const session = await staffSession("editor")
  return !!session?.user
}

// GET /api/admin/tags - List all tags
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tags = await prisma.tag.findMany({
      include: { _count: { select: {posts:true,news:true} } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ tags })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

// POST /api/admin/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { name, slug } = await request.json()
    if (!name || !slug) {
      return NextResponse.json({ error: 'Missing name or slug' }, { status: 400 })
    }
    const tag = await prisma.tag.create({
      data: { name, slug }
    })
    return NextResponse.json({ tag })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}

// PUT /api/admin/tags - Update a tag (by id)
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id, name, slug } = await request.json()
    if (!id || !name || !slug) {
      return NextResponse.json({ error: 'Missing id, name, or slug' }, { status: 400 })
    }
    const tag = await prisma.tag.update({
      where: { id },
      data: { name, slug }
    })
    return NextResponse.json({ tag })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
  }
}

// DELETE /api/admin/tags - Delete a tag (by id in body)
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }
    const removed=await prisma.tag.deleteMany({where:{id,posts:{none:{}},news:{none:{}}}});
    if(!removed.count) return NextResponse.json({error:"Remove this tag from its stories before deleting it."},{status:409});
    return NextResponse.json({ message: 'Tag deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
  }
}

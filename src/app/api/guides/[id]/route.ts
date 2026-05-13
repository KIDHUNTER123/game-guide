import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const guide = await db.guide.findUnique({
    where: { id },
    include: {
      game: { select: { id: true, title: true, slug: true } },
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true, likes: true, bookmarks: true } },
    },
  })
  if (!guide) return NextResponse.json({ error: "攻略不存在" }, { status: 404 })

  // increment view count
  await db.guide.update({ where: { id }, data: { viewCount: { increment: 1 } } })

  return NextResponse.json(guide)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth()
  if (session instanceof Response) return session

  const { id } = await params
  const guide = await db.guide.findUnique({ where: { id } })
  if (!guide) return NextResponse.json({ error: "攻略不存在" }, { status: 404 })

  const userId = (session.user as { id: string; role?: string }).id
  const userRole = (session.user as { role?: string }).role
  if (guide.authorId !== userId && userRole !== "ADMIN") {
    return NextResponse.json({ error: "无权编辑此攻略" }, { status: 403 })
  }

  const { title, slug, content, excerpt, coverImage, status, gameId } = await request.json()
  const updated = await db.guide.update({
    where: { id },
    data: { title, slug, content, excerpt, coverImage, status, gameId },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth()
  if (session instanceof Response) return session

  const { id } = await params
  const guide = await db.guide.findUnique({ where: { id } })
  if (!guide) return NextResponse.json({ error: "攻略不存在" }, { status: 404 })

  const userId = (session.user as { id: string; role?: string }).id
  const userRole = (session.user as { role?: string }).role
  if (guide.authorId !== userId && userRole !== "ADMIN") {
    return NextResponse.json({ error: "无权删除此攻略" }, { status: 403 })
  }

  await db.guide.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

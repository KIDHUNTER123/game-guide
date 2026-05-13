import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: guideId } = await params
  const comments = await db.comment.findMany({
    where: { guideId, parentId: null },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(comments)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth()
  if (session instanceof Response) return session

  const { id: guideId } = await params
  const { content, parentId } = await request.json()

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 })
  }

  const comment = await db.comment.create({
    data: {
      content,
      userId: (session.user as { id: string }).id,
      guideId,
      parentId: parentId || null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })
  return NextResponse.json(comment, { status: 201 })
}

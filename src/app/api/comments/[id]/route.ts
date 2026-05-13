import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

async function getSession() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 })
  }
  return session
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (session instanceof Response) return session

  const { id } = await params
  const { content } = await request.json()

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 })
  }

  const comment = await db.comment.findUnique({ where: { id } })
  if (!comment) return NextResponse.json({ error: "评论不存在" }, { status: 404 })

  const userId = (session.user as { id: string }).id
  const userRole = (session.user as { role?: string }).role
  if (comment.userId !== userId && userRole !== "ADMIN") {
    return NextResponse.json({ error: "无权编辑此评论" }, { status: 403 })
  }

  const updated = await db.comment.update({
    where: { id },
    data: { content },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (session instanceof Response) return session

  const { id } = await params
  const comment = await db.comment.findUnique({ where: { id } })
  if (!comment) return NextResponse.json({ error: "评论不存在" }, { status: 404 })

  const userId = (session.user as { id: string; role?: string }).id
  const userRole = (session.user as { role?: string }).role
  if (comment.userId !== userId && userRole !== "ADMIN") {
    return NextResponse.json({ error: "无权删除此评论" }, { status: 403 })
  }

  await db.comment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

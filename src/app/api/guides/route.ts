import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get("gameId")
  const status = searchParams.get("status") || "PUBLISHED"
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "12")
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (gameId) where.gameId = gameId
  if (status) where.status = status

  const [guides, total] = await Promise.all([
    db.guide.findMany({
      where,
      include: {
        game: { select: { id: true, title: true, slug: true } },
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.guide.count({ where }),
  ])

  return NextResponse.json({ guides, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(request: Request) {
  const session = await requireAuth()
  if (session instanceof Response) return session

  const { title, slug, content, excerpt, coverImage, gameId } = await request.json()
  const guide = await db.guide.create({
    data: {
      title,
      slug,
      content: content || "",
      excerpt,
      coverImage,
      gameId,
      authorId: (session.user as { id: string }).id,
    },
  })
  return NextResponse.json(guide, { status: 201 })
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

export async function POST(request: Request) {
  const session = await requireAuth()
  if (session instanceof Response) return session

  const { guideId } = await request.json()
  const userId = (session.user as { id: string }).id

  const existing = await db.bookmark.findUnique({
    where: { userId_guideId: { userId, guideId } },
  })
  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } })
    return NextResponse.json({ bookmarked: false })
  }

  await db.bookmark.create({ data: { userId, guideId } })
  return NextResponse.json({ bookmarked: true })
}

export async function GET() {
  const session = await requireAuth()
  if (session instanceof Response) return session

  const userId = (session.user as { id: string }).id
  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    include: {
      guide: {
        include: {
          game: { select: { id: true, title: true, slug: true } },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(bookmarks)
}

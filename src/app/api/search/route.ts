import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")
  const limitParam = searchParams.get("limit")
  const isSuggest = limitParam !== null

  if (!q || q.length < 1) {
    return NextResponse.json({ guides: [], games: [], total: 0 })
  }

  if (isSuggest) {
    const take = Math.min(parseInt(limitParam) || 5, 10)
    const [games, guides] = await Promise.all([
      db.game.findMany({
        where: { title: { contains: q } },
        select: { id: true, title: true, slug: true },
        take,
      }),
      db.guide.findMany({
        where: { status: "PUBLISHED", title: { contains: q } },
        select: { id: true, title: true },
        take,
      }),
    ])
    return NextResponse.json({ games, guides })
  }

  const [games, guides] = await Promise.all([
    db.game.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      },
      include: {
        categories: { include: { category: true } },
        _count: { select: { guides: { where: { status: "PUBLISHED" } } } },
      },
      take: 5,
    }),
    db.guide.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
        ],
      },
      include: {
        game: { select: { id: true, title: true, slug: true } },
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, likes: true } },
      },
      take: 20,
    }),
  ])

  return NextResponse.json({ games, guides, total: games.length + guides.length })
}

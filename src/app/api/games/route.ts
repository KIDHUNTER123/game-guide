import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-utils"
import { toPinyin } from "@/lib/pinyin"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const sort = searchParams.get("sort") || "all"
  const letter = searchParams.get("letter")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const skip = (page - 1) * limit

  let where: any = {}
  if (category && category !== "全部") {
    where.categories = { some: { category: { name: category } } }
  }
  if (sort === "popular") where.popular = true
  if (letter) {
    where.OR = [
      { title: { startsWith: letter } },
      { pinyin: { startsWith: letter.toLowerCase() } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  let take = limit
  if (sort === "alpha") orderBy = { title: "asc" }
  if (sort === "latest") take = 10

  const [games, total] = await Promise.all([
    db.game.findMany({
      where,
      include: {
        categories: { include: { category: true } },
        _count: { select: { guides: { where: { status: "PUBLISHED" } } } },
      },
      orderBy,
      skip: sort === "latest" ? 0 : skip,
      take,
    }),
    db.game.count({ where }),
  ])

  return NextResponse.json({ games, total, page, totalPages: Math.ceil(total / take) })
}

export async function POST(request: Request) {
  const error = await requireAdmin()
  if (error) return error

  const { title, slug, coverImage, description, categoryIds, popular } = await request.json()
  const pinyin = toPinyin(title)
  const game = await db.game.create({
    data: {
      title, slug, pinyin, coverImage, description, popular: popular || false,
      categories: {
        create: (categoryIds || []).map((id: string) => ({ categoryId: id })),
      },
    },
  })
  return NextResponse.json(game, { status: 201 })
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-utils"
import { toPinyin } from "@/lib/pinyin"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const game = await db.game.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      _count: { select: { guides: { where: { status: "PUBLISHED" } } } },
      guides: {
        where: { status: "PUBLISHED" },
        include: {
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
  if (!game) return NextResponse.json({ error: "游戏不存在" }, { status: 404 })
  return NextResponse.json(game)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const error = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { title, slug, coverImage, description, categoryIds, popular } = await request.json()
  const pinyin = toPinyin(title)
  const game = await db.game.update({
    where: { id },
    data: {
      title, slug, pinyin, coverImage, description, popular,
      categories: {
        deleteMany: {},
        create: (categoryIds || []).map((id: string) => ({ categoryId: id })),
      },
    },
  })
  return NextResponse.json(game)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const error = await requireAdmin()
  if (error) return error

  const { id } = await params
  await db.game.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

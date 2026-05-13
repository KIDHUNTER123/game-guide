import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-utils"

export async function GET() {
  const slides = await db.heroSlide.findMany({
    orderBy: { order: "asc" },
  })
  return NextResponse.json(slides)
}

export async function POST(request: Request) {
  const error = await requireAdmin()
  if (error) return error

  const { imageUrl, gameSlug } = await request.json()
  if (!imageUrl) {
    return NextResponse.json({ error: "请上传图片" }, { status: 400 })
  }

  const maxOrder = await db.heroSlide.aggregate({ _max: { order: true } })
  const slide = await db.heroSlide.create({
    data: { imageUrl, gameSlug: gameSlug || null, order: (maxOrder._max.order ?? -1) + 1 },
  })
  return NextResponse.json(slide, { status: 201 })
}

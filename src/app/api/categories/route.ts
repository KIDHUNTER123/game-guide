import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-utils"

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { games: true } } },
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const error = await requireAdmin()
  if (error) return error

  const { name } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "请输入分类名称" }, { status: 400 })
  }

  const existing = await db.category.findUnique({ where: { name: name.trim() } })
  if (existing) {
    return NextResponse.json({ error: "该分类已存在" }, { status: 409 })
  }

  const category = await db.category.create({ data: { name: name.trim() } })
  return NextResponse.json(category, { status: 201 })
}

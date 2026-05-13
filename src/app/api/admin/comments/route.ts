import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireEditor } from "@/lib/auth-utils"

export async function GET(request: Request) {
  const error = await requireEditor()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "30")
  const skip = (page - 1) * limit

  const [comments, total] = await Promise.all([
    db.comment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        guide: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.comment.count(),
  ])

  return NextResponse.json({ comments, total, page, totalPages: Math.ceil(total / limit) })
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

export async function POST(request: Request) {
  const session = await requireAuth()
  if (session instanceof Response) return session

  const { guideId } = await request.json()
  const userId = (session.user as { id: string }).id

  const existing = await db.like.findUnique({
    where: { userId_guideId: { userId, guideId } },
  })
  if (existing) {
    await db.like.delete({ where: { id: existing.id } })
    return NextResponse.json({ liked: false })
  }

  await db.like.create({ data: { userId, guideId } })
  return NextResponse.json({ liked: true })
}

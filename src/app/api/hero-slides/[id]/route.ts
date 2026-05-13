import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-utils"

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const error = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await _request.json()
  const slide = await db.heroSlide.update({ where: { id }, data: body })
  return NextResponse.json(slide)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const error = await requireAdmin()
  if (error) return error

  const { id } = await params
  await db.heroSlide.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

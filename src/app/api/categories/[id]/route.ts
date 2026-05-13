import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-utils"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const error = await requireAdmin()
  if (error) return error

  const { id } = await params
  await db.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

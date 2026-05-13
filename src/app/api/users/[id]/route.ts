import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/auth-utils"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const userId = (session.user as { id: string }).id
  const userRole = (session.user as { role?: string }).role

  // only self or admin can update
  if (userId !== id && userRole !== "ADMIN") {
    return NextResponse.json({ error: "无权修改此用户" }, { status: 403 })
  }

  // role changes require admin
  if (body.role && userRole !== "ADMIN") {
    return NextResponse.json({ error: "需要管理员权限" }, { status: 403 })
  }

  const data: Record<string, string> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.role && userRole === "ADMIN") {
    if (!["USER", "EDITOR", "ADMIN"].includes(body.role)) {
      return NextResponse.json({ error: "无效的角色" }, { status: 400 })
    }
    data.role = body.role
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "没有可更新的字段" }, { status: 400 })
  }

  const user = await db.user.update({
    where: { id },
    data,
  })

  return NextResponse.json({ id: user.id, name: user.name, role: user.role })
}

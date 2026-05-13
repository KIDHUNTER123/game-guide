import { auth } from "./auth"
import { NextResponse } from "next/server"

export async function getSession() {
  return await auth()
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "需要管理员权限" }, { status: 403 })
  }
  return null
}

export async function requireEditor() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 })
  }
  const role = (session.user as { role?: string }).role
  if (role !== "ADMIN" && role !== "EDITOR") {
    return NextResponse.json({ error: "需要编辑者以上权限" }, { status: 403 })
  }
  return null
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 })
  }
  return session
}

export async function requireSelf(userId: string) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 })
  }
  if ((session.user as { id: string }).id !== userId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 })
  }
  return null
}

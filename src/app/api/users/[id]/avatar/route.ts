import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-utils"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAuth()
  if (session instanceof Response) return session

  const { id } = await params
  const userId = (session.user as { id: string }).id
  if (userId !== id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "未选择文件" }, { status: 400 })

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "仅支持 jpg/png/webp/gif 格式" }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "文件大小不能超过 5MB" }, { status: 400 })
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
  const filename = `avatar-${userId}-${Date.now()}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")

  await mkdir(uploadDir, { recursive: true })
  const bytes = await file.arrayBuffer()
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))

  const url = `/uploads/avatars/${filename}`

  await db.user.update({
    where: { id: userId },
    data: { image: url },
  })

  return NextResponse.json({ url })
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: Request) {
  const { email } = await request.json()
  if (!email) {
    return NextResponse.json({ error: "请输入邮箱" }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    // Don't reveal whether the email exists
    return NextResponse.json({ message: "如果该邮箱已注册，重置链接已发送" })
  }

  const token = crypto.randomBytes(32).toString("hex")
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await db.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  })

  const resetUrl = `${new URL(request.url).origin}/reset-password?token=${token}`

  // Send email
  let previewUrl: string | null = null
  try {
    previewUrl = await sendPasswordResetEmail(email, resetUrl)
  } catch (err) {
    console.error("Failed to send email:", err)
  }

  return NextResponse.json({ message: "如果该邮箱已注册，重置链接已发送", previewUrl })
}

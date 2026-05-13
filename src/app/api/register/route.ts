import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码为必填项" }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 })
    }

    const hashed = await hash(password, 12)
    const user = await db.user.create({
      data: { name: name || email.split("@")[0], email, password: hashed },
    })

    return NextResponse.json({ id: user.id, name: user.name, email: user.email })
  } catch {
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 })
  }
}

import { Suspense } from "react"
import { LoginForm } from "./login-form"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "登录 - 游戏攻略" }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold">
            🎮 游戏攻略
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">登录你的账号</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-muted-foreground">
          还没有账号？{" "}
          <Link href="/register" className="text-primary hover:underline">
            立即注册
          </Link>
        </p>
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-muted-foreground hover:text-primary underline">
            忘记密码？
          </Link>
        </p>
      </div>
    </div>
  )
}

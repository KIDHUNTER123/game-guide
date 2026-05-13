import { RegisterForm } from "./register-form"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "注册 - 游戏攻略" }

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold">
            🎮 游戏攻略
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">创建你的账号</p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          已有账号？{" "}
          <Link href="/login" className="text-primary hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}

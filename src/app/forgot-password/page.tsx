"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string; previewUrl?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()

    if (res.ok) {
      setResult({ type: "success", message: data.message, previewUrl: data.previewUrl })
    } else {
      setResult({ type: "error", message: data.error || "请求失败" })
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold">🎮 游戏攻略</Link>
          <p className="mt-2 text-sm text-muted-foreground">重置你的密码</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-4 w-4" />
              忘记密码
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result?.type === "success" ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-md bg-primary/5 p-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">邮件已发送</p>
                    <p className="text-muted-foreground mt-1">{result.message}</p>
                    {result.previewUrl && (
                      <div className="mt-3 p-2 bg-muted rounded text-xs break-all">
                        <p className="font-medium mb-1">开发模式 — 查看测试邮件：</p>
                        <a href={result.previewUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{result.previewUrl}</a>
                      </div>
                    )}
                  </div>
                </div>
                <Button className="w-full" render={<Link href="/login" />}>返回登录</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {result?.type === "error" && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {result.message}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  输入注册时使用的邮箱，我们将发送密码重置链接。
                </p>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "发送中..." : "发送重置链接"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> 返回登录
          </Link>
        </p>
      </div>
    </div>
  )
}

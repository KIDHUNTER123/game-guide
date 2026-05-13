"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RichEditor } from "@/components/admin/rich-editor"
import { CoverImageInput } from "@/components/admin/cover-image-input"
import { toast } from "sonner"

interface Game { id: string; title: string }

interface GuideFormProps {
  initialData?: {
    id?: string
    title: string
    slug: string
    content: string
    excerpt?: string | null
    coverImage?: string | null
    status: string
    gameId: string
  }
}

export function GuideForm({ initialData }: GuideFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id
  const [loading, setLoading] = useState(false)
  const [games, setGames] = useState<Game[]>([])

  const [form, setForm] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    coverImage: initialData?.coverImage || "",
    status: initialData?.status || "DRAFT",
    gameId: initialData?.gameId || "",
  })

  useEffect(() => {
    fetch("/api/games?limit=100")
      .then((r) => r.json())
      .then((data) => setGames(data.games || []))
  }, [])

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.gameId) { toast.error("请选择所属游戏"); return }
    setLoading(true)

    const url = isEdit ? `/api/guides/${initialData!.id}` : "/api/guides"
    const method = isEdit ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      toast.success(isEdit ? "攻略已更新" : "攻略已创建")
      router.push("/admin/guides")
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || "操作失败")
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "编辑攻略" : "新建攻略"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">攻略标题</Label>
              <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={(e) => update("slug", e.target.value)} required placeholder="my-guide" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gameId">所属游戏</Label>
              <Select value={form.gameId} onValueChange={(v) => update("gameId", v || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="选择游戏" />
                </SelectTrigger>
                <SelectContent>
                  {games.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v || "DRAFT")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">草稿</SelectItem>
                  <SelectItem value="PUBLISHED">发布</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CoverImageInput value={form.coverImage} onChange={(v) => update("coverImage", v)} />
            <div className="space-y-2">
              <Label htmlFor="excerpt">摘要</Label>
              <Input id="excerpt" value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} placeholder="简短描述..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label>攻略内容</Label>
            <RichEditor content={form.content} onChange={(v) => update("content", v)} />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : isEdit ? "更新攻略" : "创建攻略"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

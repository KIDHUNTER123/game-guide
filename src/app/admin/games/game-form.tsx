"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CoverImageInput } from "@/components/admin/cover-image-input"
import { toast } from "sonner"

interface GameFormProps {
  allCategories: { id: string; name: string }[]
  initialData?: {
    id?: string
    title: string
    slug: string
    coverImage?: string | null
    description: string
    popular?: boolean
    categories?: { categoryId: string }[]
  }
}

export function GameForm({ allCategories, initialData }: GameFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id
  const [loading, setLoading] = useState(false)

  const initialCategoryIds = new Set(initialData?.categories?.map((c) => c.categoryId) || [])

  const [form, setForm] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    coverImage: initialData?.coverImage || "",
    description: initialData?.description || "",
    popular: initialData?.popular || false,
  })

  const [selectedCategories, setSelectedCategories] =
    useState<Set<string>>(initialCategoryIds)

  function update(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const url = isEdit ? `/api/games/${initialData!.id}` : "/api/games"
    const method = isEdit ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        categoryIds: Array.from(selectedCategories),
      }),
    })

    if (res.ok) {
      toast.success(isEdit ? "游戏已更新" : "游戏已创建")
      router.push("/admin/games")
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
        <CardTitle>{isEdit ? "编辑游戏" : "新增游戏"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="title">游戏名称</Label>
            <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL 标识)</Label>
            <Input id="slug" value={form.slug} onChange={(e) => update("slug", e.target.value)} required placeholder="elden-ring" />
          </div>
          <CoverImageInput value={form.coverImage} onChange={(v) => update("coverImage", v)} />
          <div className="space-y-2">
            <Label>游戏分类（可多选）</Label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <label
                  key={cat.id}
                  className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors border ${
                    selectedCategories.has(cat.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted hover:bg-muted/80 border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="hidden"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="popular"
              checked={form.popular}
              onChange={(e) => update("popular", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="popular" className="cursor-pointer">热门游戏</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">游戏描述</Label>
            <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} required />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : isEdit ? "更新游戏" : "创建游戏"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

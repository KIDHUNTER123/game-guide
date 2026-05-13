"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

export function CategoryManager({
  initialCategories,
}: {
  initialCategories: { id: string; name: string; _count: { games: number } }[]
}) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  async function addCategory() {
    if (!name.trim()) return
    setLoading(true)
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    })
    if (res.ok) {
      toast.success("分类已创建")
      setName("")
      router.refresh()
      const newCat = await res.json()
      setCategories((prev) => [...prev, { ...newCat, _count: { games: 0 } }])
    } else {
      const data = await res.json()
      toast.error(data.error || "创建失败")
    }
    setLoading(false)
  }

  async function deleteCategory(id: string, gameCount: number) {
    if (gameCount > 0) {
      toast.error(`该分类下有 ${gameCount} 个游戏，无法删除`)
      return
    }
    if (!confirm("确定删除该分类？")) return
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("分类已删除")
      router.refresh()
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } else {
      toast.error("删除失败")
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新增分类</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入分类名称"
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
            />
            <Button onClick={addCategory} disabled={loading || !name.trim()}>
              添加
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>已有分类</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无分类</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <span className="text-sm font-medium">{cat.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {cat._count.games} 个游戏
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCategory(cat.id, cat._count.games)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { Trash2, ArrowUp, ArrowDown, ImagePlus, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Slide {
  id: string
  imageUrl: string
  gameSlug: string | null
  order: number
  active: boolean
}

interface Game {
  id: string
  title: string
  slug: string
}

export function SlideManager({
  initialSlides,
  games,
}: {
  initialSlides: Slide[]
  games: Game[]
}) {
  const router = useRouter()
  const [slides, setSlides] = useState(initialSlides)
  const [uploading, setUploading] = useState(false)
  const [selectedGame, setSelectedGame] = useState("")

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", { method: "POST", body: formData })
    if (!res.ok) {
      toast.error("上传失败")
      setUploading(false)
      return
    }

    const { url } = await res.json()
    const slideRes = await fetch("/api/hero-slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url, gameSlug: selectedGame || undefined }),
    })

    if (slideRes.ok) {
      toast.success("轮播图已添加")
      router.refresh()
      const newSlide = await slideRes.json()
      setSlides((prev) => [...prev, newSlide])
      setSelectedGame("")
    } else {
      toast.error("添加失败")
    }
    setUploading(false)
  }

  async function deleteSlide(id: string) {
    if (!confirm("确定删除该轮播图？")) return
    const res = await fetch(`/api/hero-slides/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("已删除")
      router.refresh()
      setSlides((prev) => prev.filter((s) => s.id !== id))
    } else {
      toast.error("删除失败")
    }
  }

  async function moveSlide(id: string, direction: "up" | "down") {
    const idx = slides.findIndex((s) => s.id === id)
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === slides.length - 1) return

    const newSlides = [...slides]
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    ;[newSlides[idx], newSlides[swapIdx]] = [newSlides[swapIdx], newSlides[idx]]
    newSlides.forEach((s, i) => (s.order = i))
    setSlides(newSlides)

    await Promise.all(
      newSlides.map((s) =>
        fetch(`/api/hero-slides/${s.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: s.order }),
        })
      )
    )
    router.refresh()
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/hero-slides/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    })
    if (res.ok) {
      router.refresh()
      setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, active: !current } : s)))
    }
  }

  async function updateGame(id: string, gameSlug: string) {
    const res = await fetch(`/api/hero-slides/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameSlug: gameSlug || null }),
    })
    if (res.ok) {
      toast.success("已更新跳转链接")
      router.refresh()
      setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, gameSlug: gameSlug || null } : s)))
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>添加轮播图</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">上传图片</label>
            <label className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed px-4 py-8 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
              <ImagePlus className="h-6 w-6" />
              <span className="text-sm">{uploading ? "上传中..." : "点击选择图片"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">跳转到游戏（可选）</label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">不跳转</option>
              {games.map((g) => (
                <option key={g.id} value={g.slug}>{g.title}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>当前轮播图</CardTitle>
        </CardHeader>
        <CardContent>
          {slides.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无轮播图，添加后将在首页展示</p>
          ) : (
            <div className="space-y-3">
              {slides.map((slide, i) => (
                <div
                  key={slide.id}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <div className="w-32 h-16 rounded bg-muted shrink-0 overflow-hidden">
                    <img
                      src={slide.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={slide.gameSlug || ""}
                        onChange={(e) => updateGame(slide.id, e.target.value)}
                        className="flex h-8 w-full max-w-48 rounded-md border border-input bg-transparent px-2 py-1 text-xs"
                      >
                        <option value="">不跳转</option>
                        {games.map((g) => (
                          <option key={g.id} value={g.slug}>{g.title}</option>
                        ))}
                      </select>
                      {slide.gameSlug && (
                        <Link href={`/games/${slide.gameSlug}`} target="_blank">
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={i === 0}
                        onClick={() => moveSlide(slide.id, "up")}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={i === slides.length - 1}
                        onClick={() => moveSlide(slide.id, "down")}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <button
                        onClick={() => toggleActive(slide.id, slide.active)}
                        className={`ml-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                          slide.active
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {slide.active ? "显示" : "隐藏"}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => deleteSlide(slide.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

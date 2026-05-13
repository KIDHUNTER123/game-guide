import { Metadata } from "next"
import { db } from "@/lib/db"
import { SlideManager } from "./slide-manager"

export const metadata: Metadata = { title: "首页轮播管理 - 后台" }

export default async function AdminHeroSlidesPage() {
  const [slides, games] = await Promise.all([
    db.heroSlide.findMany({ orderBy: { order: "asc" } }),
    db.game.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, slug: true } }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">首页轮播管理</h1>
      <p className="text-sm text-muted-foreground mb-6">
        管理首页 Hero 区域的背景轮播图。点击图片可跳转到对应的游戏页面。
      </p>
      <SlideManager initialSlides={slides} games={games} />
    </div>
  )
}

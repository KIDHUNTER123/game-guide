import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game/game-card"
import { GuideCard } from "@/components/guide/guide-card"
import { HeroCarousel } from "@/components/home/hero-carousel"
import { db } from "@/lib/db"
import { Gamepad2, Sparkles } from "lucide-react"

export default async function HomePage() {
  const [games, guides, heroSlides] = await Promise.all([
    db.game.findMany({
      include: {
        categories: { include: { category: true } },
        _count: { select: { guides: { where: { status: "PUBLISHED" } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.guide.findMany({
      where: { status: "PUBLISHED" },
      include: {
        game: { select: { id: true, title: true, slug: true } },
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.heroSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { id: true, imageUrl: true, gameSlug: true },
    }),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="relative overflow-hidden rounded-xl">
            {/* Background with aspect ratio */}
            <div className="relative aspect-[21/9] max-md:aspect-video">
              {heroSlides.length > 0 ? (
                <HeroCarousel slides={heroSlides} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10" />
              )}
            </div>

            {/* Content overlay */}
            <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
              <div className={`w-full px-8 md:px-12 ${heroSlides.length > 0 ? "text-white" : ""}`}>
                <div className="animate-fade-in-up pointer-events-none">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary pointer-events-auto mb-4">
                    <Sparkles className="h-3 w-3" />
                    全站攻略持续更新中
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight pointer-events-auto">
                    游戏攻略<span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">聚合平台</span>
                  </h1>
                  <p className={`mt-4 max-w-2xl md:text-lg pointer-events-auto ${
                    heroSlides.length > 0 ? "text-white/80" : "text-muted-foreground"
                  }`}>
                    汇集最全的游戏指南、通关攻略、隐藏要素，助你畅玩每一款游戏。
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3 pointer-events-auto">
                    <Button size="lg" className="animate-glow-pulse" nativeButton={false} render={<Link href="/games" />}>
                      <Gamepad2 className="h-4 w-4 mr-1.5" />浏览游戏库
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">游戏库</h2>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/games" />}>查看全部 →</Button>
        </div>
        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Gamepad2 className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">暂无游戏，等待管理员添加</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {games.map((game, i) => (
              <div key={game.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <GameCard game={game} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Latest guides */}
      <section className="mx-auto max-w-6xl px-4 py-12 border-t">
        <h2 className="text-xl font-bold mb-6">最新攻略</h2>
        {guides.length === 0 ? (
          <p className="text-muted-foreground text-sm">还没有攻略发布</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

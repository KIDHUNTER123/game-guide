import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { GuideCard } from "@/components/guide/guide-card"
import { db } from "@/lib/db"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const game = await db.game.findUnique({ where: { slug } })
  return { title: game?.title || "游戏详情" }
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params
  const game = await db.game.findUnique({
    where: { slug },
    include: {
      categories: { include: { category: true } },
      _count: { select: { guides: { where: { status: "PUBLISHED" } } } },
      guides: {
        where: { status: "PUBLISHED" },
        include: {
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!game) notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Game Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="aspect-video w-full md:w-64 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center shrink-0">
          {game.coverImage ? (
            <img src={game.coverImage} alt={game.title} className="h-full w-full object-cover rounded-lg" />
          ) : (
            <span className="text-6xl">🎮</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {game.categories.map((gc) => (
              <Badge key={gc.category.id}>{gc.category.name}</Badge>
            ))}
            <span className="text-sm text-muted-foreground">
              {game._count.guides} 篇攻略
            </span>
          </div>
          <h1 className="text-2xl font-bold">{game.title}</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">{game.description}</p>
        </div>
      </div>

      {/* Guides List */}
      <h2 className="text-xl font-bold mb-4">攻略列表</h2>
      {game.guides.length === 0 ? (
        <p className="text-muted-foreground">暂无攻略</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {game.guides.map((guide) => (
            <GuideCard key={guide.id} guide={{ ...guide, game: undefined }} />
          ))}
        </div>
      )}
    </div>
  )
}

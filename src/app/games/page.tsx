import { Metadata } from "next"
import { Suspense } from "react"
import { GameCard } from "@/components/game/game-card"
import { db } from "@/lib/db"
import { GamesFilter } from "./games-filter"

export const metadata: Metadata = { title: "游戏库" }

interface Props {
  searchParams: Promise<{ category?: string; sort?: string; letter?: string; page?: string }>
}

export default async function GamesPage({ searchParams }: Props) {
  const params = await searchParams
  const category = params.category || ""
  const sort = params.sort || "all"
  const letter = params.letter || ""
  const page = parseInt(params.page || "1")
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = {}
  if (category && category !== "全部") {
    where.categories = { some: { category: { name: category } } }
  }
  if (sort === "popular") where.popular = true
  if (letter) {
    where.OR = [
      { title: { startsWith: letter } },
      { pinyin: { startsWith: letter.toLowerCase() } },
    ]
  }

  let orderBy: Record<string, string> = { createdAt: "desc" }
  let take = limit
  if (letter) orderBy = { title: "asc" }
  if (sort === "latest") take = 10

  const [games, total, allCategories] = await Promise.all([
    db.game.findMany({
      where,
      include: {
        categories: { include: { category: true } },
        _count: { select: { guides: { where: { status: "PUBLISHED" } } } },
      },
      orderBy,
      skip: sort === "latest" ? 0 : skip,
      take,
    }),
    db.game.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ])

  const totalPages = Math.ceil(total / take)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">游戏库</h1>

      <Suspense fallback={<div className="h-10" />}>
        <GamesFilter categories={allCategories} />
      </Suspense>

      {games.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {letter ? `没有以"${letter}"开头的游戏` : "暂无游戏"}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {totalPages > 1 && sort !== "latest" && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <a
              key={i}
              href={`/games?${category ? `category=${category}&` : ""}${sort !== "all" ? `sort=${sort}&` : ""}${letter ? `letter=${letter}&` : ""}page=${i + 1}`}
              className={`px-3 py-1 rounded text-sm ${
                page === i + 1
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

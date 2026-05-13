import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Flame } from "lucide-react"

interface GameCardProps {
  game: {
    id: string
    title: string
    slug: string
    coverImage: string | null
    description: string
    categories: { category: { name: string } }[]
    popular?: boolean
    _count: { guides: number }
  }
}

export function GameCard({ game }: GameCardProps) {
  const firstCat = game.categories?.[0]?.category?.name
  const extraCount = (game.categories?.length || 0) - 1

  return (
    <Link href={`/games/${game.slug}`}>
      <Card className="group/card h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
          {game.coverImage ? (
            <img
              src={game.coverImage}
              alt={game.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
            />
          ) : (
            <span className="text-4xl">🎮</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
          {game.popular && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded inline-flex items-center gap-1 shadow-sm">
              <Flame className="h-3 w-3" />热门
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold truncate">{game.title}</h3>
            {firstCat && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {firstCat}{extraCount > 0 && ` +${extraCount}`}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {game.description}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            <span>{game._count.guides} 篇攻略</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

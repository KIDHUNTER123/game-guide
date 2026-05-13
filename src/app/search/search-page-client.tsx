"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GuideCard } from "@/components/guide/guide-card"
import { GameCard } from "@/components/game/game-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

export function SearchPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQ)
  const [results, setResults] = useState<{ games: any[]; guides: any[] }>({ games: [], guides: [] })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(!!initialQ)

  useEffect(() => {
    if (initialQ) performSearch(initialQ)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function performSearch(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    if (res.ok) setResults(await res.json())
    setLoading(false)
    router.push(`/search?q=${encodeURIComponent(q)}`, { scroll: false })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    performSearch(query)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索游戏或攻略..."
          className="max-w-md"
        />
        <Button type="submit" disabled={loading}>
          <Search className="h-4 w-4 mr-1" />
          搜索
        </Button>
      </form>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}

      {searched && !loading && (
        <div className="space-y-8">
          {results.games.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">相关游戏</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {results.games.map((game: any) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}

          {results.guides.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">相关攻略</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {results.guides.map((guide: any) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            </div>
          )}

          {results.games.length === 0 && results.guides.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              未找到相关结果，试试其他关键词吧
            </p>
          )}
        </div>
      )}
    </div>
  )
}

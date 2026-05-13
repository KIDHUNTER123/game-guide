"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export function HeroSearch({ compact }: { compact?: boolean }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<{ games: { id: string; title: string; slug: string }[]; guides: { id: string; title: string }[] }>({ games: [], guides: [] })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleInput(value: string) {
    setQuery(value)
    if (value.trim().length < 2) {
      setSuggestions({ games: [], guides: [] })
      setShowSuggestions(false)
      return
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&limit=5`)
    if (res.ok) {
      const data = await res.json()
      setSuggestions(data)
      setShowSuggestions(true)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function goToSearch(q: string) {
    setShowSuggestions(false)
    setQuery("")
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const hasSuggestions = suggestions.games.length > 0 || suggestions.guides.length > 0

  return (
    <div ref={ref} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => hasSuggestions && setShowSuggestions(true)}
            placeholder="搜索..."
            className={`w-full rounded-full border border-border bg-muted/60 pl-8 pr-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary focus-visible:bg-background ${
              compact ? "h-8" : "h-10"
            }`}
          />
        </div>
      </form>

      {showSuggestions && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border bg-background shadow-lg overflow-hidden z-50 min-w-60">
          {suggestions.games.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50">游戏</div>
              {suggestions.games.map((g) => (
                <button
                  key={g.id}
                  onClick={() => goToSearch(g.title)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                >
                  <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                  {g.title}
                </button>
              ))}
            </div>
          )}
          {suggestions.guides.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50">攻略</div>
              {suggestions.guides.map((g) => (
                <button
                  key={g.id}
                  onClick={() => goToSearch(g.title)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                >
                  <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                  {g.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

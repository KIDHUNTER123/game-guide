"use client"

import { useRouter, useSearchParams } from "next/navigation"

const SORT_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "popular", label: "热门" },
  { value: "latest", label: "最新" },
] as const

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export function GamesFilter({
  categories,
}: {
  categories: { name: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "all"
  const currentCategory = searchParams.get("category") || ""
  const currentLetter = searchParams.get("letter") || ""

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("page")
    router.push(`/games?${params.toString()}`)
  }

  function handleSort(value: string) {
    if (currentSort === value) {
      setParam("sort", "")
    } else {
      setParam("sort", value)
    }
  }

  function handleCategory(name: string) {
    if (currentCategory === name) {
      setParam("category", "")
    } else {
      setParam("category", name)
    }
  }

  function handleLetter(letter: string) {
    if (currentLetter === letter) {
      setParam("letter", "")
    } else {
      setParam("letter", letter)
    }
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Sort tabs — radio, click active to reset */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSort(opt.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentSort === opt.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category pills — always visible, toggle on/off */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => handleCategory(cat.name)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              currentCategory === cat.name
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Letter grid — always visible, toggle on/off */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground shrink-0">按字母</span>
        <div className="flex flex-wrap gap-1">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetter(letter)}
            className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
              currentLetter === letter
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  </div>
  )
}

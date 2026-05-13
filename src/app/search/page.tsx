import { Metadata } from "next"
import { Suspense } from "react"
import { SearchPageClient } from "./search-page-client"

export const metadata: Metadata = { title: "搜索攻略" }

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">搜索</h1>
      <Suspense fallback={<div className="text-sm text-muted-foreground">加载中...</div>}>
        <SearchPageClient />
      </Suspense>
    </div>
  )
}

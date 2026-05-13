"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, MiniStat } from "./bar-chart"
import { FileText, MessageCircle, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

interface StatsData {
  series: {
    guides: { date: string; count: number }[]
    comments: { date: string; count: number }[]
    users: { date: string; count: number }[]
  }
  topGuides: { title: string; viewCount: number; slug: string }[]
  totals: { guides: number; comments: number; users: number }
}

export function DashboardCharts() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 mt-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!data) return null

  const maxGuide = Math.max(...data.series.guides.map((d) => d.count), 1)
  const maxComment = Math.max(...data.series.comments.map((d) => d.count), 1)
  const maxUser = Math.max(...data.series.users.map((d) => d.count), 1)

  const chartConfigs = [
    { key: "guides" as const, label: "攻略趋势", icon: FileText, data: data.series.guides, color: "bg-primary", max: maxGuide },
    { key: "comments" as const, label: "评论趋势", icon: MessageCircle, data: data.series.comments, color: "bg-blue-500", max: maxComment },
    { key: "users" as const, label: "注册趋势", icon: Users, data: data.series.users, color: "bg-green-500", max: maxUser },
  ]

  return (
    <div className="space-y-6 mt-6">
      {/* Mini Stats */}
      <div className="grid grid-cols-3 gap-4">
        <MiniStat label="攻略总数" value={data.totals.guides} />
        <MiniStat label="评论总数" value={data.totals.comments} />
        <MiniStat label="用户总数" value={data.totals.users} />
      </div>

      {/* Trend Charts */}
      <div className="grid gap-4 md:grid-cols-3">
        {chartConfigs.map((cfg) => {
          const Icon = cfg.icon
          return (
            <Card key={cfg.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {cfg.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={cfg.data} color={cfg.color} />
                <p className="text-xs text-muted-foreground mt-2 text-center">近14天</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Top Guides */}
      {data.topGuides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              热门攻略 Top 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topGuides.map((g, i) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="flex items-center justify-between text-sm py-1.5 hover:text-primary transition-colors"
                >
                  <span className="truncate">
                    <span className="text-muted-foreground mr-2">#{i + 1}</span>
                    {g.title}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">{g.viewCount} 阅读</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

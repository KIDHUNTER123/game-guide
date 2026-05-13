import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireEditor } from "@/lib/auth-utils"

export async function GET() {
  const error = await requireEditor()
  if (error) return error

  const days = 14
  const since = new Date()
  since.setDate(since.getDate() - days)

  // Generate date range
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }

  function groupByDate(items: { createdAt: Date }[], key: string) {
    const map = new Map<string, number>()
    for (const item of items) {
      const d = new Date(item.createdAt).toISOString().slice(0, 10)
      map.set(d, (map.get(d) || 0) + 1)
    }
    return dates.map((date) => ({ date, count: map.get(date) || 0 }))
  }

  const [recentGuides, recentComments, recentUsers] = await Promise.all([
    db.guide.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db.comment.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ])

  // Top guides
  const topGuides = await db.guide.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { viewCount: "desc" },
    take: 5,
    select: { title: true, viewCount: true, slug: true },
  })

  // Totals
  const [totalGuides, totalComments, totalUsers] = await Promise.all([
    db.guide.count(),
    db.comment.count(),
    db.user.count(),
  ])

  return NextResponse.json({
    series: {
      guides: groupByDate(recentGuides, "createdAt"),
      comments: groupByDate(recentComments, "createdAt"),
      users: groupByDate(recentUsers, "createdAt"),
    },
    topGuides,
    totals: { guides: totalGuides, comments: totalComments, users: totalUsers },
  })
}

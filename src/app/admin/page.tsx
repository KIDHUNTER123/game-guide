import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { Gamepad2, FileText, Users, Eye } from "lucide-react"
import { DashboardCharts } from "@/components/admin/dashboard-charts"

export const metadata: Metadata = { title: "管理后台" }

export default async function AdminDashboard() {
  const [gamesCount, guidesCount, usersCount, publishedCount] = await Promise.all([
    db.game.count(),
    db.guide.count(),
    db.user.count(),
    db.guide.count({ where: { status: "PUBLISHED" } }),
  ])

  const totalViews = await db.guide.aggregate({ _sum: { viewCount: true } })

  const stats = [
    { label: "游戏总数", value: gamesCount, icon: Gamepad2 },
    { label: "攻略总数", value: guidesCount, icon: FileText },
    { label: "已发布", value: publishedCount, icon: FileText },
    { label: "用户总数", value: usersCount, icon: Users },
    { label: "总阅读量", value: totalViews._sum.viewCount || 0, icon: Eye },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  <Icon className="h-4 w-4 inline mr-1" />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <DashboardCharts />
    </div>
  )
}

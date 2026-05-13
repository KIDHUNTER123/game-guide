import Link from "next/link"
import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { DeleteGuideButton } from "./delete-button"

export const metadata: Metadata = { title: "攻略管理 - 后台" }

export default async function AdminGuidesPage() {
  const session = await auth()
  const userId = (session?.user as { id: string })?.id
  const userRole = (session?.user as { role?: string })?.role

  const guides = await db.guide.findMany({
    where: userRole === "ADMIN" ? {} : { authorId: userId },
    include: {
      game: { select: { title: true } },
      author: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">攻略管理</h1>
        <Button nativeButton={false} render={<Link href="/admin/guides/new" />}>
          <Plus className="h-4 w-4 mr-1" /> 新建攻略
        </Button>
      </div>

      {guides.length === 0 ? (
        <p className="text-muted-foreground">暂无攻略</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>攻略标题</TableHead>
              <TableHead>所属游戏</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>发布时间</TableHead>
              <TableHead className="w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guides.map((guide) => (
              <TableRow key={guide.id}>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {guide.title}
                </TableCell>
                <TableCell>{guide.game.title}</TableCell>
                <TableCell>
                  <Badge variant={guide.status === "PUBLISHED" ? "default" : "secondary"}>
                    {guide.status === "PUBLISHED" ? "已发布" : "草稿"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {guide.author.name || "匿名"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(guide.createdAt).toLocaleDateString("zh-CN")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/admin/guides/${guide.id}/edit`} />}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteGuideButton guideId={guide.id} guideTitle={guide.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

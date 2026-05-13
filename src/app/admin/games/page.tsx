import Link from "next/link"
import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { db } from "@/lib/db"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { DeleteGameButton } from "./delete-button"

export const metadata: Metadata = { title: "游戏管理 - 后台" }

export default async function AdminGamesPage() {
  const games = await db.game.findMany({
    include: {
      categories: { include: { category: true } },
      _count: { select: { guides: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">游戏管理</h1>
        <Button nativeButton={false} render={<Link href="/admin/games/new" />}>
          <Plus className="h-4 w-4 mr-1" /> 新增游戏
        </Button>
      </div>

      {games.length === 0 ? (
        <p className="text-muted-foreground">暂无游戏</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>游戏名称</TableHead>
              <TableHead>热门</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>攻略数</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-[120px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell>{game.popular ? <Badge className="bg-orange-500 text-white">热门</Badge> : "-"}</TableCell>
                <TableCell>
                  {game.categories.length > 0
                    ? game.categories.map((gc) => gc.category.name).join(", ")
                    : "-"
                  }
                </TableCell>
                <TableCell>{game._count.guides}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(game.createdAt).toLocaleDateString("zh-CN")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/admin/games/${game.id}/edit`} />}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteGameButton gameId={game.id} gameTitle={game.title} />
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

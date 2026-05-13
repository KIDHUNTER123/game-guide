import { Metadata } from "next"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { RoleSelect } from "./role-select"

export const metadata: Metadata = { title: "用户管理 - 后台" }

export default async function AdminUsersPage() {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role
  if (userRole !== "ADMIN") redirect("/admin")

  const users = await db.user.findMany({
    include: { _count: { select: { guides: true, comments: true } } },
    orderBy: { createdAt: "desc" },
  })

  const roleLabel = (role: string) =>
    role === "ADMIN" ? "管理员" : role === "EDITOR" ? "编辑者" : "用户"

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>用户</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>攻略数</TableHead>
            <TableHead>评论数</TableHead>
            <TableHead>注册时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.name || "匿名用户"}
              </TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {roleLabel(user.role)}
                </Badge>
              </TableCell>
              <TableCell>{user._count.guides}</TableCell>
              <TableCell>{user._count.comments}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString("zh-CN")}
              </TableCell>
              <TableCell>
                <RoleSelect userId={user.id} currentRole={user.role} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

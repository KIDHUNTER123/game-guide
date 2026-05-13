import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login?redirect=/admin")

  const role = (session.user as { role?: string }).role
  if (role !== "ADMIN" && role !== "EDITOR") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">权限不足</h1>
          <p className="text-muted-foreground max-w-sm">
            你的账号（{(session.user as { email?: string }).email}）没有管理后台的访问权限。
            请联系管理员分配管理员或编辑者角色。
          </p>
          <div className="flex gap-3 justify-center">
            <Button nativeButton={false} render={<Link href="/" />}>返回首页</Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/profile" />}>个人中心</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <AdminSidebar userRole={role} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}

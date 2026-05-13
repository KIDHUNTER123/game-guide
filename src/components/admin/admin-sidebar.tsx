"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Gamepad2, FileText, Users, MessageCircle, Tags, Images } from "lucide-react"

const links = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/games", label: "游戏管理", icon: Gamepad2 },
  { href: "/admin/categories", label: "分类管理", icon: Tags },
  { href: "/admin/hero-slides", label: "轮播管理", icon: Images },
  { href: "/admin/guides", label: "攻略管理", icon: FileText },
  { href: "/admin/comments", label: "评论管理", icon: MessageCircle },
  { href: "/admin/users", label: "用户管理", icon: Users, adminOnly: true },
]

export function AdminSidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname()

  const visibleLinks = links.filter(
    (link) => !link.adminOnly || userRole === "ADMIN"
  )

  return (
    <aside className="w-56 shrink-0 border-r min-h-[calc(100vh-3.5rem)] p-4">
      <nav className="space-y-1">
        {visibleLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

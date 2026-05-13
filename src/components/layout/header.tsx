import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import { auth, signOut } from "@/lib/auth"
import { MobileNav } from "./mobile-nav"
import { HeroSearch } from "../home/hero-search"

export async function Header() {
  const session = await auth()
  const user = session?.user as { name?: string; email?: string; image?: string; role?: string } | undefined

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-[0_1px_0_rgba(99,102,241,0.1)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <MobileNav
            isLoggedIn={!!user}
            isAdminOrEditor={user?.role === "ADMIN" || user?.role === "EDITOR"}
          />
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            🎮 游戏攻略
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link href="/games" className="relative text-muted-foreground hover:text-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded after:bg-primary after:transition-all hover:after:w-full">
            游戏库
          </Link>
          <div className="w-48">
            <HeroSearch compact />
          </div>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ""} alt={user.name || ""} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium truncate">{user.name || "用户"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/profile" />}>
                  个人中心
                </DropdownMenuItem>
                {(user.role === "ADMIN" || user.role === "EDITOR") && (
                  <DropdownMenuItem render={<Link href="/admin" />}>
                    管理后台
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <form
                  action={async () => {
                    "use server"
                    await signOut({ redirectTo: "/" })
                  }}
                >
                  <DropdownMenuItem
                    render={
                      <button type="submit" className="w-full cursor-pointer text-left" />
                    }
                  >
                    退出登录
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" nativeButton={false} render={<Link href="/login" />}>
                登录
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 text-white shadow-sm hover:shadow-md transition-shadow" nativeButton={false} render={<Link href="/register" />}>
                注册
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

"use client"

import Link from "next/link"
import { useState } from "react"
import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu, Gamepad2, Search, Home, User, LogIn, Shield } from "lucide-react"

interface MobileNavProps {
  isLoggedIn: boolean
  isAdminOrEditor: boolean
}

export function MobileNav({ isLoggedIn, isAdminOrEditor }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  const links = [
    { href: "/", label: "首页", icon: Home },
    { href: "/games", label: "游戏库", icon: Gamepad2 },
    { href: "/search", label: "搜索", icon: Search },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted transition-colors" aria-label="菜单">
            <Menu className="h-5 w-5" />
          </button>
        }
      />
      <SheetContent side="left" className="flex flex-col">
        <div className="h-1 w-full bg-gradient-to-r from-primary to-purple-500 shrink-0" />
        <SheetHeader>
          <SheetTitle>
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 font-bold text-lg">
              🎮 游戏攻略
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2 flex-1">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <SheetClose
                key={link.href}
                render={
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
                  />
                }
              >
                <Icon className="h-4 w-4 text-primary" />
                {link.label}
              </SheetClose>
            )
          })}

          <div className="my-2 border-t border-primary/10" />

          {isLoggedIn ? (
            <>
              <SheetClose
                render={
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                  />
                }
              >
                <User className="h-4 w-4" />
                个人中心
              </SheetClose>
              {isAdminOrEditor && (
                <SheetClose
                  render={
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                    />
                  }
                >
                  <Shield className="h-4 w-4" />
                  管理后台
                </SheetClose>
              )}
            </>
          ) : (
            <SheetClose
              render={
                <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                />
              }
            >
              <LogIn className="h-4 w-4" />
              登录
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

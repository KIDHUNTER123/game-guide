import Link from "next/link"
import { db } from "@/lib/db"

export async function Footer() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    take: 6,
  })

  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">导航</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/games" className="hover:text-primary">游戏库</Link></li>
              <li><Link href="/search" className="hover:text-primary">搜索攻略</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">游戏分类</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/games?category=${cat.name}`} className="hover:text-primary">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">热门游戏</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/games/elden-ring" className="hover:text-primary">艾尔登法环</Link></li>
              <li><Link href="/games/zelda-totk" className="hover:text-primary">塞尔达传说</Link></li>
              <li><Link href="/games/genshin-impact" className="hover:text-primary">原神</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">关于</h3>
            <p className="text-sm text-muted-foreground">
              最全的游戏攻略聚合平台，为玩家提供高质量的游戏指南。
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          © 2026 游戏攻略. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

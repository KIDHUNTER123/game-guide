import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/db"
import { Calendar, BookmarkIcon, MessageCircle, FileText } from "lucide-react"
import Link from "next/link"
import { ProfileAvatarEdit } from "@/components/avatar/profile-avatar-edit"
import { ProfileNameEdit } from "@/components/profile/profile-name-edit"

export const metadata: Metadata = { title: "个人中心" }

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/login?redirect=/profile")

  const userId = (session.user as { id: string }).id

  const [bookmarks, comments, guides] = await Promise.all([
    db.bookmark.findMany({
      where: { userId },
      include: {
        guide: {
          include: {
            game: { select: { title: true } },
            _count: { select: { comments: true, likes: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.comment.findMany({
      where: { userId },
      include: {
        guide: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.guide.findMany({
      where: { authorId: userId },
      include: {
        game: { select: { title: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const user = session.user as { name?: string; email?: string; image?: string; role?: string; id?: string }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <ProfileAvatarEdit user={user} />
        <div className="space-y-1 pt-2">
          <ProfileNameEdit userId={userId} initialName={user.name || null} />
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            角色：{user.role === "ADMIN" ? "管理员" : user.role === "EDITOR" ? "编辑者" : "用户"}
          </p>
        </div>
      </div>

      <Separator className="mb-8" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Guides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              我的攻略 ({guides.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {guides.length === 0 ? (
              <p className="text-sm text-muted-foreground">还没有发布攻略</p>
            ) : (
              <ul className="space-y-2">
                {guides.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="flex items-center justify-between text-sm hover:text-primary"
                    >
                      <span className="truncate">{g.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {g.game.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* My Bookmarks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookmarkIcon className="h-5 w-5" />
              我的收藏 ({bookmarks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarks.length === 0 ? (
              <p className="text-sm text-muted-foreground">还没有收藏攻略</p>
            ) : (
              <ul className="space-y-2">
                {bookmarks.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/guides/${b.guide.slug}`}
                      className="flex items-center justify-between text-sm hover:text-primary"
                    >
                      <span className="truncate">{b.guide.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {b.guide.game.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* My Comments */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5" />
              我的评论 ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">还没有发表评论</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className="text-sm">
                    <Link href={`/guides/${c.guide.slug}`} className="text-primary hover:underline">
                      {c.guide.title}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 line-clamp-2">{c.content}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

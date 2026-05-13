import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CommentSection } from "@/components/comment/comment-section"
import { GuideCard } from "@/components/guide/guide-card"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { Calendar, Eye, User, Clock } from "lucide-react"
import { ClientButtons } from "./client-buttons"
import { readingTime } from "@/lib/time"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = await db.guide.findUnique({ where: { slug }, select: { title: true, excerpt: true } })
  return {
    title: guide?.title || "攻略详情",
    description: guide?.excerpt || "",
  }
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()

  const guide = await db.guide.findUnique({
    where: { slug },
    include: {
      game: { select: { id: true, title: true, slug: true } },
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true, likes: true, bookmarks: true } },
    },
  })

  if (!guide || (guide.status !== "PUBLISHED" && guide.authorId !== (session?.user as { id?: string })?.id)) {
    notFound()
  }

  // check if current user has liked/bookmarked
  let isLiked = false
  let isBookmarked = false
  if (session?.user) {
    const userId = (session.user as { id: string }).id
    const [like, bookmark] = await Promise.all([
      db.like.findUnique({ where: { userId_guideId: { userId, guideId: guide.id } } }),
      db.bookmark.findUnique({ where: { userId_guideId: { userId, guideId: guide.id } } }),
    ])
    isLiked = !!like
    isBookmarked = !!bookmark
  }

  // increment view count (server-side logic was done in the API, but for direct page access)
  await db.guide.update({ where: { id: guide.id }, data: { viewCount: { increment: 1 } } })

  const date = new Date(guide.createdAt).toLocaleDateString("zh-CN")
  const readTime = readingTime(guide.content)

  // related guides: same game, published, excluding current
  const relatedGuides = await db.guide.findMany({
    where: {
      gameId: guide.gameId,
      id: { not: guide.id },
      status: "PUBLISHED",
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">首页</Link>
        <span>/</span>
        <Link href={`/games/${guide.game.slug}`} className="hover:text-primary">
          {guide.game.title}
        </Link>
        <span>/</span>
        <span className="text-foreground">{guide.title}</span>
      </div>

      {/* Header */}
      <h1 className="text-3xl font-bold tracking-tight">{guide.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={guide.author.image || ""} />
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{guide.author.name || "匿名用户"}</span>
        </div>
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {date}</span>
        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {guide.viewCount} 阅读</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {readTime} 分钟阅读</span>
        {guide.status === "DRAFT" && <Badge variant="outline">草稿</Badge>}
      </div>

      {/* Cover Image */}
      {guide.coverImage && (
        <img
          src={guide.coverImage}
          alt={guide.title}
          className="mt-6 w-full aspect-video object-cover rounded-lg"
        />
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex items-center gap-4">
        <ClientButtons
          guideId={guide.id}
          initialLiked={isLiked}
          initialBookmarked={isBookmarked}
          likesCount={guide._count.likes}
          bookmarksCount={guide._count.bookmarks}
        />
      </div>

      <Separator className="my-6" />

      {/* Content */}
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        {guide.content ? (
          <div
            dangerouslySetInnerHTML={{ __html: guide.content }}
            className="leading-relaxed"
          />
        ) : (
          <p className="text-muted-foreground">暂无内容</p>
        )}
      </article>

      <Separator className="my-8" />

      {/* Related Guides */}
      {relatedGuides.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">相关攻略</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedGuides.map((rg) => (
              <GuideCard
                key={rg.id}
                guide={{
                  ...rg,
                  game: { id: guide.game.id, title: guide.game.title, slug: guide.game.slug },
                }}
              />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-8" />

      {/* Comments */}
      <CommentSection guideId={guide.id} />
    </div>
  )
}

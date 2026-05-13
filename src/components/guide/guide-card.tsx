import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MessageCircle, Heart, User, ImageIcon } from "lucide-react"

interface GuideCardProps {
  guide: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    coverImage: string | null
    createdAt: Date | string
    author: { id: string; name: string | null; image: string | null }
    game?: { id: string; title: string; slug: string }
    _count: { comments: number; likes: number; bookmarks?: number }
  }
}

export function GuideCard({ guide }: GuideCardProps) {
  const date = new Date(guide.createdAt).toLocaleDateString("zh-CN")

  return (
    <Link href={`/guides/${guide.slug}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          {guide.coverImage ? (
            <img
              src={guide.coverImage}
              alt={guide.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={guide.author.image || ""} />
              <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {guide.author.name || "匿名用户"}
            </span>
            {guide.game && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-primary">{guide.game.title}</span>
              </>
            )}
          </div>
          <h3 className="font-semibold line-clamp-2">{guide.title}</h3>
          {guide.excerpt && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {guide.excerpt}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {date}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> {guide._count.comments}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {guide._count.likes}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

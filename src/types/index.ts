export type UserRole = "USER" | "EDITOR" | "ADMIN"
export type GuideStatus = "DRAFT" | "PUBLISHED"

export interface GameWithCount {
  id: string
  title: string
  slug: string
  coverImage: string | null
  description: string
  category: string
  createdAt: Date
  _count: { guides: number }
}

export interface GuideWithRelations {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  status: string
  viewCount: number
  createdAt: Date
  updatedAt: Date
  game: { id: string; title: string; slug: string }
  author: { id: string; name: string | null; image: string | null }
  _count: { comments: number; likes: number; bookmarks: number }
}

export interface CommentWithUser {
  id: string
  content: string
  createdAt: Date
  user: { id: string; name: string | null; image: string | null }
  replies?: CommentWithUser[]
}

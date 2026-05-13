"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Bookmark } from "lucide-react"
import { toast } from "sonner"

export function ClientButtons({
  guideId,
  initialLiked,
  initialBookmarked,
  likesCount,
  bookmarksCount,
}: {
  guideId: string
  initialLiked: boolean
  initialBookmarked: boolean
  likesCount: number
  bookmarksCount: number
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [likes, setLikes] = useState(likesCount)
  const [bookmarks, setBookmarks] = useState(bookmarksCount)

  async function toggleLike() {
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guideId }),
    })
    if (res.ok) {
      const data = await res.json()
      setLiked(data.liked)
      setLikes((c) => (data.liked ? c + 1 : c - 1))
    } else {
      toast.error("请先登录")
    }
  }

  async function toggleBookmark() {
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guideId }),
    })
    if (res.ok) {
      const data = await res.json()
      setBookmarked(data.bookmarked)
      setBookmarks((c) => (data.bookmarked ? c + 1 : c - 1))
    } else {
      toast.error("请先登录")
    }
  }

  return (
    <>
      <Button variant={liked ? "default" : "outline"} size="sm" onClick={toggleLike}>
        <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
        {likes}
      </Button>
      <Button variant={bookmarked ? "default" : "outline"} size="sm" onClick={toggleBookmark}>
        <Bookmark className={`h-4 w-4 mr-1 ${bookmarked ? "fill-current" : ""}`} />
        {bookmarks}
      </Button>
    </>
  )
}

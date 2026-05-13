"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageCircle, User, Trash2, Pencil, Check, X, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { relativeTime } from "@/lib/time"

interface CommentUser {
  id: string
  name: string | null
  image: string | null
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: CommentUser
  replies?: Comment[]
}

const PAGE_SIZE = 10

export function CommentSection({ guideId }: { guideId: string }) {
  const { data: session } = useSession()
  const currentUser = session?.user as { id?: string; name?: string; image?: string } | undefined

  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/guides/${guideId}/comments`)
    if (res.ok) setComments(await res.json())
    setLoading(false)
  }, [guideId])

  useEffect(() => { fetchComments() }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    const res = await fetch(`/api/guides/${guideId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      setContent("")
      toast.success("评论成功")
      fetchComments()
    } else {
      const data = await res.json()
      toast.error(data.error || "评论失败")
    }
    setSubmitting(false)
  }

  const handleReply = async (parentId: string, parentUserName: string) => {
    if (!replyContent.trim()) return
    const res = await fetch(`/api/guides/${guideId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: `@${parentUserName} ${replyContent}`, parentId }),
    })
    if (res.ok) {
      setReplyTo(null)
      setReplyContent("")
      toast.success("回复成功")
      fetchComments()
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("确定删除这条评论吗？")) return
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("已删除")
      fetchComments()
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const saveEdit = async (commentId: string) => {
    if (!editContent.trim()) return
    setSavingEdit(true)
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    })
    if (res.ok) {
      toast.success("已更新")
      setEditingId(null)
      fetchComments()
    } else {
      const data = await res.json()
      toast.error(data.error || "更新失败")
    }
    setSavingEdit(false)
  }

  const displayComments = comments.slice(0, displayCount)
  const hasMore = displayCount < comments.length

  const canModify = (commentUserId: string) =>
    currentUser?.id === commentUserId || currentUser?.id === undefined

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-2 font-semibold text-lg">
        <MessageCircle className="h-5 w-5" />
        评论 ({comments.length})
      </h3>

      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="写下你的评论..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
            {submitting ? "发表中..." : "发表评论"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          请先<a href="/login" className="text-primary hover:underline ml-1">登录</a>后再评论
        </p>
      )}

      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">暂无评论，来抢沙发吧</p>
        )}

        {displayComments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={comment.user.image || ""} />
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">
                    {comment.user.name || "匿名用户"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {relativeTime(comment.createdAt)}
                  </span>
                </div>

                {editingId === comment.id ? (
                  <div className="mt-1 space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(comment.id)} disabled={savingEdit || !editContent.trim()}>
                        <Check className="h-3 w-3 mr-1" />
                        {savingEdit ? "保存中..." : "保存"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="h-3 w-3 mr-1" />
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                )}

                {editingId !== comment.id && (
                  <div className="mt-1 flex items-center gap-2">
                    {session && (
                      <button
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        回复
                      </button>
                    )}
                    {currentUser?.id === comment.user.id && (
                      <>
                        <button
                          onClick={() => startEdit(comment)}
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-3 w-3 inline mr-0.5" />编辑
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 inline mr-0.5" />删除
                        </button>
                      </>
                    )}
                  </div>
                )}

                {replyTo === comment.id && (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      placeholder={`回复 @${comment.user.name || "匿名用户"}...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleReply(comment.id, comment.user.name || "匿名用户")}>
                        回复
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
                        取消
                      </Button>
                    </div>
                  </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 space-y-3 pl-4 border-l-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage src={reply.user.image || ""} />
                          <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">
                              {reply.user.name || "匿名用户"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {relativeTime(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">
                            {reply.content}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2">
                            {currentUser?.id === reply.user.id && (
                              <button
                                onClick={() => handleDelete(reply.id)}
                                className="text-xs text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3 inline mr-0.5" />删除
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDisplayCount((c) => c + PAGE_SIZE)}>
              <ChevronDown className="h-4 w-4 mr-1" />
              加载更多评论 ({comments.length - displayCount} 条)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

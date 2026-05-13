"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2, LinkIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string | null; email: string }
  guide: { id: string; title: string; slug: string }
}

export function CommentList() {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/comments?limit=100")
    if (res.ok) {
      const data = await res.json()
      setComments(data.comments || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchComments() }, [fetchComments])

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const res = await fetch(`/api/comments/${deleteId}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("评论已删除")
      setComments((prev) => prev.filter((c) => c.id !== deleteId))
      router.refresh()
    } else {
      toast.error("删除失败")
    }
    setDeleting(false)
    setDeleteId(null)
  }

  const formatDate = (d: string) => new Date(d).toLocaleString("zh-CN")

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <>
      {comments.length === 0 ? (
        <p className="text-muted-foreground">暂无评论</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>评论内容</TableHead>
              <TableHead>所属攻略</TableHead>
              <TableHead>时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{comment.user.name || "匿名"}</p>
                    <p className="text-xs text-muted-foreground">{comment.user.email}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="text-sm line-clamp-2">{comment.content}</p>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/guides/${comment.guide.slug}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                    target="_blank"
                  >
                    <LinkIcon className="h-3 w-3" />
                    {comment.guide.title}
                  </Link>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(comment.createdAt)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(comment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条评论吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground"
            >
              {deleting ? "删除中..." : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

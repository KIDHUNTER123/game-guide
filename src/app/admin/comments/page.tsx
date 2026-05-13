import { Metadata } from "next"
import { CommentList } from "./comment-list"

export const metadata: Metadata = { title: "评论管理 - 后台" }

export default function AdminCommentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">评论管理</h1>
      <CommentList />
    </div>
  )
}

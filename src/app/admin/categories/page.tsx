import { Metadata } from "next"
import { db } from "@/lib/db"
import { CategoryManager } from "./category-manager"

export const metadata: Metadata = { title: "分类管理 - 后台" }

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { games: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">分类管理</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  )
}

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { GameForm } from "../../game-form"
import { db } from "@/lib/db"

export const metadata: Metadata = { title: "编辑游戏 - 后台" }

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [game, allCategories] = await Promise.all([
    db.game.findUnique({
      where: { id },
      include: { categories: true },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ])
  if (!game) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">编辑游戏</h1>
      <GameForm initialData={game} allCategories={allCategories} />
    </div>
  )
}

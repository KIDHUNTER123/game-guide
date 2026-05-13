import { Metadata } from "next"
import { GameForm } from "../game-form"
import { db } from "@/lib/db"

export const metadata: Metadata = { title: "新增游戏 - 后台" }

export default async function NewGamePage() {
  const allCategories = await db.category.findMany({ orderBy: { name: "asc" } })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新增游戏</h1>
      <GameForm allCategories={allCategories} />
    </div>
  )
}

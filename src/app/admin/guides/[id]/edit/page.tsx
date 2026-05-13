import { Metadata } from "next"
import { notFound } from "next/navigation"
import { GuideForm } from "../../guide-form"
import { db } from "@/lib/db"

export const metadata: Metadata = { title: "编辑攻略 - 后台" }

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const guide = await db.guide.findUnique({ where: { id } })
  if (!guide) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">编辑攻略</h1>
      <GuideForm initialData={guide} />
    </div>
  )
}

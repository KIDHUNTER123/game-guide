import { Metadata } from "next"
import { GuideForm } from "../guide-form"

export const metadata: Metadata = { title: "新建攻略 - 后台" }

export default function NewGuidePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新建攻略</h1>
      <GuideForm />
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Check, X } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface ProfileNameEditProps {
  userId: string
  initialName: string | null
}

export function ProfileNameEdit({ userId, initialName }: ProfileNameEditProps) {
  const router = useRouter()
  const { data: session, update: sessionUpdate } = useSession()
  const currentName = (session?.user as { name?: string } | undefined)?.name || initialName
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentName || "")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    })
    if (res.ok) {
      await sessionUpdate({ name: name.trim() })
      toast.success("昵称已更新")
      setEditing(false)
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || "更新失败")
    }
    setSaving(false)
  }

  function handleCancel() {
    setName(currentName || "")
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-xs"
          autoFocus
        />
        <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
          <Check className="h-4 w-4 mr-1" />
          {saving ? "保存中..." : "保存"}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold">{currentName || "未设置昵称"}</h1>
      <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  )
}

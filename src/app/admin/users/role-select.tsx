"use client"

import { useRouter } from "next/navigation"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const ROLES = [
  { value: "USER", label: "用户" },
  { value: "EDITOR", label: "编辑者" },
  { value: "ADMIN", label: "管理员" },
]

export function RoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const router = useRouter()

  async function handleChange(role: string) {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    if (res.ok) {
      toast.success("角色已更新")
      router.refresh()
    } else {
      toast.error("更新失败")
    }
  }

  return (
    <Select defaultValue={currentRole} onValueChange={(v) => { if (v) handleChange(v) }}>
      <SelectTrigger className="w-24 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

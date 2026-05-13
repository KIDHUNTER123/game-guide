"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, Camera } from "lucide-react"
import { AvatarCropDialog } from "./avatar-crop-dialog"

interface UserInfo {
  name?: string
  email?: string
  image?: string
  role?: string
  id?: string
}

export function ProfileAvatarEdit({ user }: { user: UserInfo }) {
  const { update } = useSession()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user.image || "")

  const handleAvatarUpdated = async (newUrl: string) => {
    setAvatarUrl(newUrl)
    await update({ image: newUrl })
  }

  const roleLabel =
    user.role === "ADMIN" ? "管理员" : user.role === "EDITOR" ? "编辑者" : "用户"

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <div className="relative group">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute bottom-0 right-0 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
            onClick={() => setDialogOpen(true)}
            aria-label="更换头像"
          >
            <Camera className="h-3 w-3" />
          </Button>
        </div>
        <div>
          <h1 className="text-xl font-bold">{user.name || "用户"}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-primary mt-1">{roleLabel}</p>
        </div>
      </div>
      <AvatarCropDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={user.id!}
        onAvatarUpdated={handleAvatarUpdated}
      />
    </>
  )
}

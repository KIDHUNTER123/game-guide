"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface CoverImageInputProps {
  value: string
  onChange: (url: string) => void
}

export function CoverImageInput({ value, onChange }: CoverImageInputProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("仅支持 JPG、PNG、WebP、GIF 格式")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("文件大小不能超过 5MB")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", { method: "POST", body: formData })
    if (res.ok) {
      const data = await res.json()
      onChange(data.url)
      toast.success("封面上传成功")
    } else {
      const data = await res.json()
      toast.error(data.error || "上传失败")
    }
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      <Label>封面图片</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="输入 URL 或点击上传"
          className="flex-1"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploading ? "上传中..." : "上传"}
        </Button>
      </div>
      {value && (
        <div className="aspect-video w-48 rounded-lg border overflow-hidden bg-muted">
          <img
            src={value}
            alt="封面预览"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none"
            }}
          />
        </div>
      )}
    </div>
  )
}

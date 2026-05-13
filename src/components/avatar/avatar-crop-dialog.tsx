"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Upload, X, ArrowLeft } from "lucide-react"
import { getCroppedImg } from "@/lib/crop-image"

interface AvatarCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onAvatarUpdated: (url: string) => void
}

export function AvatarCropDialog({
  open,
  onOpenChange,
  userId,
  onAvatarUpdated,
}: AvatarCropDialogProps) {
  const [imgSrc, setImgSrc] = useState("")
  const [crop, setCrop] = useState<Crop>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (imgSrc) URL.revokeObjectURL(imgSrc)
    }
  }, [imgSrc])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setError("仅支持 JPG、PNG、WebP、GIF 格式")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("文件大小不能超过 5MB")
      return
    }

    if (imgSrc) URL.revokeObjectURL(imgSrc)
    setImgSrc(URL.createObjectURL(file))
  }, [imgSrc])

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const size = Math.min(width, height) * 0.5
    setCrop({
      unit: "px",
      x: (width - size) / 2,
      y: (height - size) / 2,
      width: size,
      height: size,
    })
  }, [])

  const handleReset = useCallback(() => {
    if (imgSrc) URL.revokeObjectURL(imgSrc)
    setImgSrc("")
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }, [imgSrc])

  const handleCropAndUpload = useCallback(async () => {
    if (!imgRef.current || !crop) return

    setIsProcessing(true)
    try {
      // crop values from onChange are already in display pixels
      const blob = await getCroppedImg(imgRef.current, {
        x: crop.x,
        y: crop.y,
        width: crop.width,
        height: crop.height,
      }, 300)
      const formData = new FormData()
      formData.append("file", blob, "avatar.jpg")

      const res = await fetch(`/api/users/${userId}/avatar`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "上传失败")
      }
      const data = await res.json()
      onAvatarUpdated(data.url)
      onOpenChange(false)
      toast.success("头像已更新")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "头像上传失败")
    } finally {
      setIsProcessing(false)
    }
  }, [crop, userId, onAvatarUpdated, onOpenChange])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) handleReset()
    onOpenChange(open)
  }, [handleReset, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>上传头像</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {!imgSrc ? (
            <div className="flex flex-col items-center gap-4 py-8 w-full">
              <div
                className="flex flex-col items-center justify-center gap-2 w-full max-w-[300px] aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">点击选择图片</span>
                <span className="text-xs text-muted-foreground/70">
                  支持 JPG、PNG、WebP、GIF，最大 5MB
                </span>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-[400px] w-full"
              >
                <img
                  ref={(el) => { imgRef.current = el }}
                  src={imgSrc}
                  alt="裁剪预览"
                  className="max-h-[400px] w-full object-contain"
                  onLoad={handleImageLoad}
                />
              </ReactCrop>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </>
          )}
        </div>

        <DialogFooter>
          {imgSrc ? (
            <>
              <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                重新选择
              </Button>
              <Button onClick={handleCropAndUpload} disabled={isProcessing}>
                {isProcessing ? "上传中..." : "确认上传"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-1" />
              取消
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

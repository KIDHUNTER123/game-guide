export function getCroppedImg(
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  targetSize = 300,
): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = targetSize
  canvas.height = targetSize
  const ctx = canvas.getContext("2d")!

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    targetSize,
    targetSize,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Canvas toBlob returned null"))
      },
      "image/jpeg",
      0.9,
    )
  })
}

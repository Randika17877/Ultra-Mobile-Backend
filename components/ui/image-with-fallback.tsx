"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { formatImageUrl } from "@/lib/utils"

interface ImageWithFallbackProps {
  src?: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackText?: string
}

export function ImageWithFallback({
  src,
  alt,
  width = 48,
  height = 48,
  className = "h-full w-full object-cover",
  fallbackText,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  const formattedSrc = formatImageUrl(src)
  const isHttpUrl = formattedSrc.startsWith("http://") || formattedSrc.startsWith("https://")

  useEffect(() => {
    setError(false)
  }, [src])

  if (!src || error || !isHttpUrl) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground text-lg font-bold uppercase select-none">
        {fallbackText ? fallbackText[0] : alt[0] || "?"}
      </div>
    )
  }

  return (
    <Image
      src={formattedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      onError={() => setError(true)}
    />
  )
}

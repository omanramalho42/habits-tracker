"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Image as ImageIcon, Video } from "lucide-react"

interface MediaPreviewProps {
  imageUrl?: string | null
  videoUrl?: string | null
}

const MediaPreview: React.FC<MediaPreviewProps> = ({
  imageUrl,
  videoUrl,
}) => {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"image" | "video" | null>(null)

  const handleOpen = (mediaType: "image" | "video") => {
    setType(mediaType)
    setOpen(true)
  }

  return (
    <>
      <TooltipProvider>
        <div className="flex gap-2">

          {/* IMAGE */}
          {imageUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => handleOpen("image")}>
                  <ImageIcon className="w-4 h-4 cursor-pointer hover:scale-110 transition" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Visualizar imagem
              </TooltipContent>
            </Tooltip>
          )}

          {/* VIDEO */}
          {videoUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => handleOpen("video")}>
                  <Video className="w-4 h-4 cursor-pointer hover:scale-110 transition" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Visualizar vídeo
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl w-full flex items-center justify-center">

          <div className="w-full flex items-center justify-center">

            {type === "image" && imageUrl && (
              <Image
                src={imageUrl}
                alt="preview"
                width={1000}
                height={800}
                className="rounded-lg object-contain max-w-full max-h-[80vh] w-auto h-auto"
              />
            )}

            {type === "video" && videoUrl && (
              <video
                src={videoUrl}
                controls
                className="rounded-lg object-contain max-w-full max-h-[80vh] w-auto h-auto"
              />
            )}

          </div>

        </DialogContent>
      </Dialog>
    </>
  )
}

export default MediaPreview
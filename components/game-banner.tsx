import Image from "next/image"
import { MediaStatus } from "@/lib/types"
import { StatusDot } from "@/components/status-dot"

interface GameBannerProps {
  title: string
  image: string
  status?: MediaStatus
}

export function GameBanner({ title, image, status }: GameBannerProps) {
  return (
    <div className="group relative flex-1 min-h-[100px] overflow-hidden rounded-lg">
      <div className="relative h-full w-full overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 280px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        {status && <StatusDot status={status} />}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-[13px] font-medium text-foreground truncate">{title}</p>
        </div>
      </div>
    </div>
  )
}

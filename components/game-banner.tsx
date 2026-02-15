import Image from "next/image"
import { MediaStatus, MediaType } from "@/lib/types"
import { StatusDot } from "@/components/status-dot"
import { MediaItemMenu } from "@/components/media-item-menu"

interface GameBannerProps {
  title: string
  image: string
  status?: MediaStatus
  userRating?: number
  onRate?: (rating: number) => void
  onClearRating?: () => void
  onStatusChange?: (status: MediaStatus) => void
  onDelete?: () => void
}

export function GameBanner({
  title,
  image,
  status,
  userRating,
  onRate,
  onClearRating,
  onStatusChange,
  onDelete
}: GameBannerProps) {
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

        {/* Actions Menu */}
        <div className="absolute top-1.5 right-1.5 z-20 opacity-0 transition-opacity group-hover:opacity-100 data-[has-rating=true]:opacity-100" data-has-rating={!!userRating}>
          <MediaItemMenu
            status={status || 'plan'}
            type="game"
            userRating={userRating}
            onRate={onRate}
            onClearRating={onClearRating}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-[13px] font-medium text-foreground truncate">{title}</p>
        </div>
      </div>
    </div>
  )
}

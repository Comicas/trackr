import Image from "next/image"
import { MediaStatus, MediaType } from "@/lib/types"
import { StatusDot } from "@/components/status-dot"
import { MediaItemMenu } from "@/components/media-item-menu"

interface CoverCardProps {
  title: string
  image: string
  year?: number | string
  rating?: number
  compact?: boolean
  status?: MediaStatus
  userRating?: number
  type: MediaType
  onRate?: (rating: number) => void
  onClearRating?: () => void
  onStatusChange?: (status: MediaStatus) => void
  onDelete?: () => void
}

export function CoverCard({
  title,
  image,
  year,
  rating,
  compact,
  status,
  userRating,
  type,
  onRate,
  onClearRating,
  onStatusChange,
  onDelete
}: CoverCardProps) {
  return (
    <div className="group flex flex-col gap-1.5 relative">
      <div className={`relative w-full overflow-hidden rounded-lg bg-muted ${compact ? 'aspect-[3/4]' : 'aspect-[2/3]'}`}>
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 150px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-foreground/10 pointer-events-none" />
        {status && <StatusDot status={status} />}

        {/* Actions Menu */}
        <div className="absolute top-1.5 right-1.5 z-20 opacity-0 transition-opacity group-hover:opacity-100 data-[has-rating=true]:opacity-100" data-has-rating={!!userRating}>
          <MediaItemMenu
            status={status || 'plan'}
            type={type}
            userRating={userRating}
            onRate={onRate}
            onClearRating={onClearRating}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        </div>

        {/* External Rating (only show if no user rating or not hovering) */}
        {rating && !userRating && (
          <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm transition-opacity group-hover:opacity-0 pointer-events-none">
            {rating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-[11px] font-medium text-foreground/90 leading-tight line-clamp-2" title={title}>
          {title}
        </p>
        {year && (
          <p className="text-[10px] text-muted-foreground">
            {year}
          </p>
        )}
      </div>
    </div>
  )
}

import Image from "next/image"

interface CoverCardProps {
  title: string
  image: string
  year?: number | string
  rating?: number
  compact?: boolean
}

export function CoverCard({ title, image, year, rating, compact }: CoverCardProps) {
  return (
    <div className="group flex flex-col gap-1.5">
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
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-foreground/10" />
        {rating && (
          <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
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

import Image from "next/image"
import { MediaStatus } from "@/lib/types"
import { StatusDot } from "@/components/status-dot"

interface MiniCoverCardProps {
  title: string
  image: string
  status?: MediaStatus
}

export function MiniCoverCard({ title, image, status }: MiniCoverCardProps) {
  return (
    <div
      className="group relative flex-none w-[70px] cursor-pointer transition-transform hover:-translate-y-1"
      title={title} // Native tooltip
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted shadow-sm ring-1 ring-border/20 transition-shadow group-hover:shadow-md group-hover:ring-border/40">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="70px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {status && <StatusDot status={status} className="!h-2 !w-2 !top-1 !left-1 !ring-1" />}
      </div>
    </div>
  )
}

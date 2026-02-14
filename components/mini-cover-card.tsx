import Image from "next/image"

interface MiniCoverCardProps {
  title: string
  image: string
}

export function MiniCoverCard({ title, image }: MiniCoverCardProps) {
  return (
    <div className="group flex flex-col items-center gap-0.5">
      <div className="relative aspect-[4/5] w-3/4 overflow-hidden rounded-sm">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="48px"
        />
        <div className="absolute inset-0 rounded-sm ring-1 ring-inset ring-foreground/10" />
      </div>
      <p className="text-[7px] font-medium text-muted-foreground leading-none line-clamp-1 text-center">
        {title}
      </p>
    </div>
  )
}

import Image from "next/image"

interface ProfileCardProps {
  name: string
  bio: string
  image: string
  stats: {
    anime: number
    games: number
    movies: number
    series: number
  }
}

export function ProfileCard({ name, bio, image }: ProfileCardProps) {
  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-border bg-card">
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 300px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h2 className="text-sm font-semibold text-foreground">{name}</h2>
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{bio}</p>
      </div>
    </div>
  )
}

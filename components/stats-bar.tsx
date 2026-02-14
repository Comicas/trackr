import { Gamepad2, Tv, Film, Monitor } from "lucide-react"

interface StatsBarProps {
  stats: {
    anime: number
    games: number
    movies: number
    series: number
  }
}

export function StatsBar({ stats }: StatsBarProps) {
  const statItems = [
    { label: "Anime", value: stats.anime, icon: Tv, color: "text-lavender" },
    { label: "Games", value: stats.games, icon: Gamepad2, color: "text-pink" },
    { label: "Movies", value: stats.movies, icon: Film, color: "text-peach" },
    { label: "Series", value: stats.series, icon: Monitor, color: "text-cream" },
  ]

  return (
    <div className="flex items-center justify-center gap-6 rounded-xl border border-border bg-card px-4 py-3 sm:gap-10">
      {statItems.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center gap-0.5">
          <stat.icon className={`h-4 w-4 ${stat.color}`} />
          <span className="text-lg font-bold text-foreground tabular-nums">{stat.value}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}

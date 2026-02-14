'use client';

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { BentoSection } from "@/components/bento-section"
import { CoverCard } from "@/components/cover-card"
import { MiniCoverCard } from "@/components/mini-cover-card"
import { GameBanner } from "@/components/game-banner"
import { ProfileCard } from "@/components/profile-card"
import { StatsBar } from "@/components/stats-bar"
import { Button } from "@/components/ui/button"
import { SearchModal } from "@/components/search-modal"
import { MediaType } from "@/lib/types"

const games = [
  { title: "Elden Ring", image: "/images/games/elden-ring.jpg" },
  { title: "Hollow Knight", image: "/images/games/hollow-knight.jpg" },
  { title: "Persona 5 Royal", image: "/images/games/persona5.jpg" },
]

const anime = [
  { title: "Sousou no Frieren", image: "/images/anime/frieren.jpg" },
  { title: "Jujutsu Kaisen", image: "/images/anime/jjk.jpg" },
  { title: "Vinland Saga", image: "/images/anime/vinland.jpg" },
  { title: "Spy x Family", image: "/images/anime/spy-family.jpg" },
]

const thisSeason = [
  { title: "Solo Leveling", image: "/images/anime/solo-leveling.jpg" },
  { title: "Dandadan", image: "/images/anime/dandadan.jpg" },
  { title: "Sakamoto Days", image: "/images/anime/sakamoto-days.jpg" },
  { title: "Dr. Stone", image: "/images/anime/dr-stone.jpg" },
]

const movies = [
  { title: "Interstellar", image: "/images/movies/interstellar.jpg" },
  { title: "Spirited Away", image: "/images/movies/spirited-away.jpg" },
  { title: "Blade Runner 2049", image: "/images/movies/blade-runner.jpg" },
  { title: "Your Name", image: "/images/movies/your-name.jpg" },
]

const series = [
  { title: "Breaking Bad", image: "/images/series/breaking-bad.jpg" },
  { title: "Dark", image: "/images/series/dark.jpg" },
  { title: "Arcane", image: "/images/series/arcane.jpg" },
  { title: "Severance", image: "/images/series/severance.jpg" },
]

const profile = {
  name: "Alex Chen",
  bio: "Avid media enthusiast. Always watching, playing, or discovering something new.",
  image: "/images/profile.jpg",
  stats: { anime: 142, games: 87, movies: 253, series: 96 },
}

export default function Home() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchType, setSearchType] = React.useState<MediaType>('movie');
  const [allowedTypes, setAllowedTypes] = React.useState<MediaType[]>(['movie']);

  const openSearch = (type: MediaType, allowed: MediaType[] = [type]) => {
    setSearchType(type);
    setAllowedTypes(allowed);
    setSearchOpen(true);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Search Modal */}
      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        initialType={searchType}
        allowedTypes={allowedTypes}
      />

      <div className="mx-auto w-full max-w-[1200px] px-4 py-5">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-sm font-bold text-primary font-display">M</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground font-display">
              MediaVault
            </h1>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-fr">

          {/* ── ROW 1, LEFT: Movies ── */}
          <div className="md:col-span-1 lg:col-span-3 lg:col-start-1 lg:row-start-1">
            <BentoSection title={
              <div className="flex items-center gap-2">
                <Link href="/movies" className="hover:underline">Movies</Link>
                <button onClick={() => openSearch('movie')} className="p-0.5 rounded-sm hover:bg-black/10 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            } accentColor="bg-peach" className="h-full">
              <div className="grid grid-cols-2 gap-2">
                {movies.map((movie) => (
                  <CoverCard key={movie.title} {...movie} />
                ))}
              </div>
            </BentoSection>
          </div>

          {/* ── CENTER: Anime ... */}
          <div className="md:col-span-1 lg:col-span-6 lg:col-start-4 lg:row-start-1">
            <BentoSection title={
              <div className="flex items-center gap-2">
                <Link href="/anime" className="hover:underline">Anime</Link>
                <button onClick={() => openSearch('anime')} className="p-0.5 rounded-sm hover:bg-black/10 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            } accentColor="bg-lavender" className="h-full">
              <div className="flex h-full flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {anime.map((item) => (
                    <CoverCard key={item.title} {...item} />
                  ))}
                </div>
                <div className="border-t border-border pt-1">
                  <div className="mb-1 flex items-center justify-center gap-1">
                    <div className="h-1 w-1 rounded-full bg-sky" />
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
                      This Season
                    </span>
                  </div>
                  <div className="mx-auto grid w-5/6 grid-cols-4 gap-3">
                    {thisSeason.map((item) => (
                      <MiniCoverCard key={item.title} {...item} />
                    ))}
                  </div>
                </div>
              </div>
            </BentoSection>
          </div>

          {/* ... Games ... */}
          <div className="md:col-span-1 lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-1">
            <BentoSection title={
              <div className="flex items-center gap-2">
                <Link href="/games" className="hover:underline">Games</Link>
                <button onClick={() => openSearch('game')} className="p-0.5 rounded-sm hover:bg-black/10 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            } accentColor="bg-pink" className="h-full">
              <div className="flex h-full flex-col gap-2">
                {games.map((game) => (
                  <GameBanner key={game.title} {...game} />
                ))}
              </div>
            </BentoSection>
          </div>

          {/* ... ROW 2 ... */}
          <div className="md:col-span-1 lg:col-span-3 lg:col-start-1 lg:row-start-2">
            <ProfileCard {...profile} />
          </div>

          <div className="md:col-span-1 lg:col-span-6 lg:col-start-4 lg:row-start-2">
            <div className="flex h-full flex-col gap-2.5">
              <StatsBar stats={profile.stats} />
              <BentoSection title={
                <div className="flex items-center gap-2">
                  <Link href="/series" className="hover:underline">Series</Link>
                  <button onClick={() => openSearch('series')} className="p-0.5 rounded-sm hover:bg-black/10 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              } accentColor="bg-cream" className="flex-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {series.map((item) => (
                    <CoverCard key={item.title} {...item} />
                  ))}
                </div>
              </BentoSection>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-5 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            {"Tracking your universe, one title at a time."}
          </p>
        </footer>
      </div>
    </main>
  )
}

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
import { MediaType, MediaStatus } from "@/lib/types"
import { useCompletedCounts } from "@/hooks/use-completed-counts"
import { repo } from "@/lib/storage/repo"

export default function Home() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchType, setSearchType] = React.useState<MediaType>('movie');
  const [allowedTypes, setAllowedTypes] = React.useState<MediaType[]>(['movie']);

  // Dynamic data from IndexedDB
  const [moviesData, setMoviesData] = React.useState<Array<{ media: any; entry: any }>>([]);
  const [seriesData, setSeriesData] = React.useState<Array<{ media: any; entry: any }>>([]);
  const [gamesData, setGamesData] = React.useState<Array<{ media: any; entry: any }>>([]);
  const [animeData, setAnimeData] = React.useState<{
    thisSeason: Array<{ media: any; entry: any }>;
    main: Array<{ media: any; entry: any }>;
  }>({ thisSeason: [], main: [] });

  const completedCounts = useCompletedCounts();

  // Load data on mount and when repo changes
  const loadData = React.useCallback(async () => {
    const [movies, series, games, anime] = await Promise.all([
      repo.getHomeSection('movie', 4, ['watching'], ['completed']),
      repo.getHomeSection('series', 4, ['watching'], ['completed']),
      repo.getHomeSection('game', 3, ['playing'], ['completed']),
      repo.getHomeAnimeSections(),
    ]);

    setMoviesData(movies);
    setSeriesData(series);
    setGamesData(games);
    setAnimeData(anime);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    const unsubscribe = repo.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  const openSearch = (type: MediaType, allowed: MediaType[] = [type]) => {
    setSearchType(type);
    setAllowedTypes(allowed);
    setSearchOpen(true);
  };

  const handleRate = async (mediaId: string, rating: number) => {
    await repo.updateEntry(mediaId, { userRating: rating });
  };

  const handleClearRating = async (mediaId: string) => {
    await repo.updateEntry(mediaId, { userRating: undefined });
  };

  const handleStatusChange = async (mediaId: string, status: MediaStatus) => {
    await repo.setEntryStatus(mediaId, status);
  };

  const handleDelete = async (mediaId: string) => {
    await repo.removeEntry(mediaId);
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
                {moviesData.map((item) => (
                  <CoverCard
                    key={item.media.id}
                    title={item.media.title}
                    image={item.media.coverUrl || ''}
                    year={item.media.year}
                    rating={item.media.rating}
                    status={item.entry.status}
                    userRating={item.entry.userRating}
                    type={item.media.type}
                    onRate={(r) => handleRate(item.media.id, r)}
                    onClearRating={() => handleClearRating(item.media.id)}
                    onStatusChange={(s) => handleStatusChange(item.media.id, s)}
                    onDelete={() => handleDelete(item.media.id)}
                  />
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
                  {animeData.main.map((item) => (
                    <CoverCard
                      key={item.media.id}
                      title={item.media.title}
                      image={item.media.coverUrl || ''}
                      year={item.media.year}
                      rating={item.media.rating}
                      status={item.entry.status}
                      userRating={item.entry.userRating}
                      type={item.media.type}
                      onRate={(r) => handleRate(item.media.id, r)}
                      onClearRating={() => handleClearRating(item.media.id)}
                      onStatusChange={(s) => handleStatusChange(item.media.id, s)}
                      onDelete={() => handleDelete(item.media.id)}
                    />
                  ))}
                </div>
                {animeData.thisSeason.length > 0 && (
                  <div className="mt-auto border-t border-border pt-1.5 px-0.5">
                    <div className="mb-2 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.5)]" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
                        This Season
                      </span>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-1.5 pl-0.5 scrollbar-thin scrollbar-thumb-foreground/10 scrollbar-track-transparent">
                      {animeData.thisSeason.map((item) => (
                        <MiniCoverCard
                          key={item.media.id}
                          title={item.media.title}
                          image={item.media.coverUrl || ''}
                          status={item.entry.status}
                          userRating={item.entry.userRating}
                          type={item.media.type}
                          onRate={(r) => handleRate(item.media.id, r)}
                          onClearRating={() => handleClearRating(item.media.id)}
                          onStatusChange={(s) => handleStatusChange(item.media.id, s)}
                          onDelete={() => handleDelete(item.media.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
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
                {gamesData.map((item) => (
                  <GameBanner
                    key={item.media.id}
                    title={item.media.title}
                    image={item.media.coverUrl || ''}
                    status={item.entry.status}
                    userRating={item.entry.userRating}
                    type={item.media.type}
                    onRate={(r) => handleRate(item.media.id, r)}
                    onClearRating={() => handleClearRating(item.media.id)}
                    onStatusChange={(s) => handleStatusChange(item.media.id, s)}
                    onDelete={() => handleDelete(item.media.id)}
                  />
                ))}
              </div>
            </BentoSection>
          </div>

          {/* ... ROW 2 ... */}
          <div className="md:col-span-1 lg:col-span-3 lg:col-start-1 lg:row-start-2">
            <ProfileCard
              name="Comicas"
              bio="blablabla fuc fuc fuc"
              image="/images/profile.jpg"
              stats={{ anime: 0, games: 0, movies: 0, series: 0 }}
            />
          </div>

          <div className="md:col-span-1 lg:col-span-6 lg:col-start-4 lg:row-start-2">
            <div className="flex h-full flex-col gap-2.5">
              <StatsBar stats={completedCounts} />
              <BentoSection title={
                <div className="flex items-center gap-2">
                  <Link href="/series" className="hover:underline">Series</Link>
                  <button onClick={() => openSearch('series')} className="p-0.5 rounded-sm hover:bg-black/10 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              } accentColor="bg-cream" className="flex-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {seriesData.map((item) => (
                    <CoverCard
                      key={item.media.id}
                      title={item.media.title}
                      image={item.media.coverUrl || ''}
                      year={item.media.year}
                      rating={item.media.rating}
                      status={item.entry.status}
                      userRating={item.entry.userRating}
                      type={item.media.type}
                      onRate={(r) => handleRate(item.media.id, r)}
                      onClearRating={() => handleClearRating(item.media.id)}
                      onStatusChange={(s) => handleStatusChange(item.media.id, s)}
                      onDelete={() => handleDelete(item.media.id)}
                    />
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

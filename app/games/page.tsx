'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { repo } from '@/lib/storage/repo';
import { MediaItem, MediaItemWithEntry, MediaStatus } from '@/lib/types';
import { CoverCard } from '@/components/cover-card';
import { Button } from '@/components/ui/button';
import { SearchModal } from '@/components/search-modal';

export default function GamesPage() {
    const [items, setItems] = useState<MediaItemWithEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);

    const load = async () => {
        const all = await repo.listEntriesByTypeAndStatus('game');
        setItems(all);
        setLoading(false);
    };

    const handleRate = async (mediaId: string, rating: number) => {
        await repo.updateEntry(mediaId, { userRating: rating });
        load();
    };

    const handleClearRating = async (mediaId: string) => {
        await repo.updateEntry(mediaId, { userRating: undefined });
        load();
    };

    const handleStatusChange = async (mediaId: string, status: MediaStatus) => {
        await repo.setEntryStatus(mediaId, status);
        load();
    };

    const handleDelete = async (mediaId: string) => {
        await repo.removeEntry(mediaId);
        load();
    };

    useEffect(() => {
        load();
    }, []);

    // Reload when modal closes to reflect additions
    useEffect(() => {
        if (!searchOpen) load();
    }, [searchOpen]);

    const getByStatus = (status: string) => items.filter((i) => i.entry?.status === status);

    const statuses = ['backlog', 'playing', 'completed', 'dropped'];

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-background p-8">
            <SearchModal
                open={searchOpen}
                onOpenChange={setSearchOpen}
                initialType="game"
                allowedTypes={['game']}
            />

            <div className="mx-auto max-w-[1200px]">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold font-display">Games</h1>
                    </div>
                    <Button onClick={() => setSearchOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Game
                    </Button>
                </header>

                <div className="space-y-12">
                    {statuses.map((status) => {
                        const statusItems = getByStatus(status);
                        if (statusItems.length === 0) return null;

                        return (
                            <section key={status}>
                                <h2 className="text-xl font-semibold mb-4 capitalize flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    {status}
                                    <span className="text-muted-foreground text-sm font-normal ml-2">({statusItems.length})</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {statusItems.map((item) => (
                                        <CoverCard
                                            key={item.id}
                                            title={item.title}
                                            image={item.coverUrl || ''}
                                            year={item.year}
                                            rating={item.rating}
                                            compact
                                            status={item.entry?.status}
                                            userRating={item.entry?.userRating}
                                            type="game"
                                            onRate={(r) => handleRate(item.id, r)}
                                            onClearRating={() => handleClearRating(item.id)}
                                            onStatusChange={(s) => handleStatusChange(item.id, s)}
                                            onDelete={() => handleDelete(item.id)}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}

                    {items.length === 0 && (
                        <div className="text-center text-muted-foreground py-20 bg-muted/20 rounded-xl">
                            No games tracked yet. <br />
                            <Button variant="link" onClick={() => setSearchOpen(true)}>Add your first game</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

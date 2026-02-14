'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { repo } from '@/lib/storage/repo';
import { MediaItem, MediaItemWithEntry } from '@/lib/types';
import { CoverCard } from '@/components/cover-card';
import { Button } from '@/components/ui/button';
import { SearchModal } from '@/components/search-modal';

export default function AnimePage() {
    const [items, setItems] = useState<MediaItemWithEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);

    const load = async () => {
        const all = await repo.listEntriesByTypeAndStatus('anime');
        setItems(all);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    // Reload when modal closes to reflect additions
    useEffect(() => {
        if (!searchOpen) load();
    }, [searchOpen]);

    const getByStatus = (status: string) => items.filter((i) => i.entry?.status === status);

    const statuses = ['plan', 'watching', 'completed', 'dropped'];

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-background p-8">
            <SearchModal
                open={searchOpen}
                onOpenChange={setSearchOpen}
                initialType="anime"
                allowedTypes={['anime']}
            />

            <div className="mx-auto max-w-[1200px]">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold font-display">Anime</h1>
                    </div>
                    <Button onClick={() => setSearchOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Anime
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
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}

                    {items.length === 0 && (
                        <div className="text-center text-muted-foreground py-20 bg-muted/20 rounded-xl">
                            No anime tracked yet. <br />
                            <Button variant="link" onClick={() => setSearchOpen(true)}>Add your first anime</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

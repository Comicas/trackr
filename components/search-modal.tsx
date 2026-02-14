'use client';

import * as React from 'react';
import { Search, Loader2, Plus, Film, Tv, Gamepad, Clapperboard } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { tmdb } from '@/lib/apis/tmdb';
import { anilist } from '@/lib/apis/anilist';
import { igdb } from '@/lib/apis/igdb';
import { repo } from '@/lib/storage/repo';
import { MediaItem, MediaType, MediaStatus } from '@/lib/types';
// Checking hooks dir: {"name":"hooks","isDir":true,"numChildren":2} - likely use-toast or similar. I'll just use a timeout here to be safe and simple.

export function SearchModal({
    open,
    onOpenChange,
    initialType = 'movie',
    allowedTypes = ['movie', 'series', 'anime', 'game']
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialType?: MediaType;
    allowedTypes?: MediaType[];
}) {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<MediaItem[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [type, setType] = React.useState<MediaType>(initialType);
    const [selectedItem, setSelectedItem] = React.useState<MediaItem | null>(null);
    const [status, setStatus] = React.useState<MediaStatus>('plan');

    // Reset type when initialType changes or modal opens
    React.useEffect(() => {
        if (open) {
            setType(initialType);
            setQuery('');
            setResults([]);
            setSelectedItem(null);
            setStatus(initialType === 'game' ? 'backlog' : 'plan');
        }
    }, [open, initialType]);

    // Update default status when type changes
    React.useEffect(() => {
        if (type === 'game' && status === 'plan') setStatus('backlog');
        if (type !== 'game' && status === 'backlog') setStatus('plan');
    }, [type, status]);

    // Debounce logic
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 2) {
                setLoading(true);
                try {
                    let res: MediaItem[] = [];
                    if (type === 'movie') res = await tmdb.search(query, 'movie');
                    else if (type === 'series') res = await tmdb.search(query, 'series');
                    else if (type === 'anime') res = await anilist.search(query);
                    else if (type === 'game') res = await igdb.search(query);

                    setResults(res);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, type]);

    const handleSelect = (item: MediaItem) => {
        setSelectedItem(item);
    };

    const handleSave = async () => {
        if (!selectedItem) return;
        try {
            await repo.upsertMediaItem(selectedItem);
            await repo.setEntryStatus(selectedItem.id, status);
            onOpenChange(false);
            // alert(`Added ${selectedItem.title} to ${status}!`);
        } catch (e) {
            console.error('Failed to add item', e);
            alert('Failed to add item');
        }
    };

    const handleBack = () => {
        setSelectedItem(null);
    }

    const availableStatusesWaitlist = type === 'game' ? ['backlog'] : ['plan'];
    const availableStatusesActive = type === 'game' ? ['playing'] : ['watching'];
    const availableStatusesDone = ['completed', 'dropped'];

    // Combining into a list for Select
    const statusOptions = [
        ...availableStatusesWaitlist,
        ...availableStatusesActive,
        ...availableStatusesDone
    ];


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <div className="p-4 border-b">
                    <DialogHeader className="mb-4">
                        <DialogTitle>
                            {selectedItem ? 'Select Status' : 'Add to Collection'}
                        </DialogTitle>
                    </DialogHeader>

                    {!selectedItem && allowedTypes.length > 1 && (
                        <Tabs
                            value={type}
                            onValueChange={(val) => setType(val as MediaType)}
                            className="w-full mb-4"
                        >
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="movie" disabled={!allowedTypes.includes('movie')}><Film className="w-4 h-4 mr-2" />Movie</TabsTrigger>
                                <TabsTrigger value="series" disabled={!allowedTypes.includes('series')}><Tv className="w-4 h-4 mr-2" />TV</TabsTrigger>
                                <TabsTrigger value="anime" disabled={!allowedTypes.includes('anime')}><Clapperboard className="w-4 h-4 mr-2" />Anime</TabsTrigger>
                                <TabsTrigger value="game" disabled={!allowedTypes.includes('game')}><Gamepad className="w-4 h-4 mr-2" />Game</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}

                    {!selectedItem && (
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`Search ${type}...`}
                                className="pl-9"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {selectedItem ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex gap-4">
                                <div className="w-[100px] aspect-[2/3] bg-muted rounded overflow-hidden shadow-sm flex-shrink-0">
                                    {selectedItem.coverUrl ? (
                                        <img src={selectedItem.coverUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                                    ) : <div className="w-full h-full bg-gray-200" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{selectedItem.title}</h3>
                                    <div className="text-muted-foreground text-sm">{selectedItem.year}</div>
                                    <div className="mt-2 text-sm line-clamp-4 text-muted-foreground">
                                        {selectedItem.meta?.overview || selectedItem.meta?.description || selectedItem.meta?.summary || 'No description.'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={status} onValueChange={(v) => setStatus(v as MediaStatus)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map(s => (
                                            <SelectItem key={s} value={s} className="capitalize">
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2 justify-end mt-auto">
                                <Button variant="outline" onClick={handleBack}>Back</Button>
                                <Button onClick={handleSave}>Save to Collection</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {loading ? (
                                <div className="flex justify-center items-center h-full text-muted-foreground">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Searching...
                                </div>
                            ) : results.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2">
                                    {results.map((item) => (
                                        <button
                                            key={item.sourceId}
                                            onClick={() => handleSelect(item)}
                                            className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                                        >
                                            <div className="w-[60px] aspect-[2/3] bg-muted rounded overflow-hidden flex-shrink-0 relative shadow-sm">
                                                {item.coverUrl ? (
                                                    <img
                                                        src={item.coverUrl}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground bg-gray-100">
                                                        No IMG
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <h4 className="font-semibold text-sm truncate pr-4 text-foreground group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h4>
                                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                                    <span>{item.year || 'Unknown Year'}</span>
                                                    {item.rating && (
                                                        <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                            {item.rating.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                    {item.meta?.overview || item.meta?.description || item.meta?.summary}
                                                </p>
                                            </div>
                                            <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                                <Plus className="w-5 h-5 text-primary" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-60">
                                    {query.length > 0 ? (
                                        <p>No results found for "{query}"</p>
                                    ) : (
                                        <p>Start typing to search...</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

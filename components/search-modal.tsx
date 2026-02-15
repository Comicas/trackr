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
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { tmdb } from '@/lib/apis/tmdb';
import { anilist } from '@/lib/apis/anilist';
import { igdb } from '@/lib/apis/igdb';
import { repo } from '@/lib/storage/repo';
import { MediaItem, MediaType, MediaStatus } from '@/lib/types';

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

    // Use the toast hook
    const { toast } = useToast();

    // Reset type when initialType changes or modal opens
    React.useEffect(() => {
        if (open) {
            setType(initialType);
            setQuery('');
            setResults([]);
        }
    }, [open, initialType]);

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

    const getStatuses = (itemType: MediaType): MediaStatus[] => {
        if (itemType === 'game') {
            return ['backlog', 'playing', 'completed'];
        }
        return ['plan', 'watching', 'completed', 'dropped'];
    };

    const handleQuickAdd = async (item: MediaItem, status: MediaStatus) => {
        try {
            await repo.upsertMediaItem(item);
            await repo.setEntryStatus(item.id, status);
            toast({
                title: `Added to ${status}`,
                description: item.title,
            });
            // We do NOT close the modal, allowing for rapid addition of multiple items.
        } catch (e) {
            console.error('Failed to add item', e);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to add item.',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <div className="p-4 border-b">
                    <DialogHeader className="mb-4">
                        <DialogTitle>
                            Add to Collection
                        </DialogTitle>
                    </DialogHeader>

                    {allowedTypes.length > 1 && (
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
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Searching...
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                            {results.map((item) => (
                                <div
                                    key={item.sourceId}
                                    className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group relative"
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
                                        <h4 className="font-semibold text-sm truncate pr-4 text-foreground">
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

                                    <div className="self-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Plus className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {getStatuses(type).map((status) => (
                                                    <DropdownMenuItem
                                                        key={status}
                                                        onClick={() => handleQuickAdd(item, status)}
                                                        className="capitalize cursor-pointer"
                                                    >
                                                        {status}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
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
                </div>
            </DialogContent>
        </Dialog>
    );
}


import * as React from "react"
import { MoreVertical, Trash2, Check, Star } from "lucide-react"
import { MediaStatus, MediaType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RatingPicker } from "@/components/rating-picker"
import { StatusDot } from "@/components/status-dot"

interface MediaItemMenuProps {
    status: MediaStatus
    type: MediaType
    userRating?: number
    onStatusChange?: (status: MediaStatus) => void
    onDelete?: () => void
    onRate?: (rating: number) => void
    onClearRating?: () => void
}

const ALL_STATUSES: MediaStatus[] = ['plan', 'watching', 'completed', 'dropped', 'backlog', 'playing']

export function MediaItemMenu({
    status,
    type,
    userRating,
    onStatusChange,
    onDelete,
    onRate,
    onClearRating
}: MediaItemMenuProps) {
    const [showDeleteAlert, setShowDeleteAlert] = React.useState(false)
    const [isRatingOpen, setIsRatingOpen] = React.useState(false)

    // Filter statuses based on type if needed, or just show all with appropriate labels
    // For now, we use a simple mapping for display labels if desired, or just capitalize
    const formatStatus = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

    return (
        <>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {/* Rating Badge/Picker */}
                {onRate && onClearRating && (
                    <RatingPicker
                        value={userRating}
                        onChange={onRate}
                        onClear={onClearRating}
                        side="bottom"
                    >
                        <button
                            className={`group/rating flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium backdrop-blur-sm transition-colors ${userRating
                                    ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                                    : "bg-black/40 text-white/70 hover:bg-black/60"
                                }`}
                        >
                            <Star className={`h-3 w-3 ${userRating ? "fill-current" : ""}`} />
                            {userRating ? (
                                <span>{userRating}</span>
                            ) : (
                                <span className="hidden group-hover/rating:inline text-[10px]">Rate</span>
                            )}
                        </button>
                    </RatingPicker>
                )}

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white">
                            <MoreVertical className="h-3.5 w-3.5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {onStatusChange && (
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <StatusDot status={status} className="mr-2 relative static" />
                                    <span>Status</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {ALL_STATUSES.map((s) => (
                                        <DropdownMenuItem key={s} onClick={() => onStatusChange(s)}>
                                            <StatusDot status={s} className="mr-2 relative static" />
                                            <span>{formatStatus(s)}</span>
                                            {s === status && <Check className="ml-auto h-3 w-3" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        )}

                        {onDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setShowDeleteAlert(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will delete the item from your list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                onDelete?.()
                                setShowDeleteAlert(false)
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

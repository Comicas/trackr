
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Star, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface RatingPickerProps {
    value?: number
    onChange: (value: number) => void
    onClear: () => void
    side?: "top" | "bottom" | "left" | "right"
    children?: React.ReactNode
}

export function RatingPicker({ value, onChange, onClear, side = "bottom", children }: RatingPickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    const handleSelect = (rating: number) => {
        onChange(rating)
        setIsOpen(false)
    }

    const handleClear = () => {
        onClear()
        setIsOpen(false)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {children || (
                    <button
                        className="group/rating flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Star className={cn("h-3 w-3", value ? "fill-yellow-400 text-yellow-400" : "text-white/70")} />
                        {value !== undefined ? (
                            <span>{value}</span>
                        ) : (
                            <span className="hidden group-hover/rating:inline text-[10px]">Rate</span>
                        )}
                    </button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" side={side} onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-6 gap-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                            <Button
                                key={rating}
                                variant={value === rating ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                    "h-8 w-8 p-0 text-xs font-medium",
                                    value === rating ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                                )}
                                onClick={() => handleSelect(rating)}
                            >
                                {rating}
                            </Button>
                        ))}
                    </div>
                    {value !== undefined && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-full text-xs text-muted-foreground hover:text-destructive"
                            onClick={handleClear}
                        >
                            Clear Rating
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

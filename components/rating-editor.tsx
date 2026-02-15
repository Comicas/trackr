
import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Star, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface RatingEditorProps {
    value?: number
    onChange: (value: number) => void
    onClear: () => void
    side?: "top" | "bottom" | "left" | "right"
}

export function RatingEditor({ value, onChange, onClear, side = "bottom" }: RatingEditorProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [tempValue, setTempValue] = React.useState(value || 0)

    // Sync temp value when prop changes or popover opens
    React.useEffect(() => {
        if (isOpen) {
            setTempValue(value || 0)
        }
    }, [isOpen, value])

    const handleSave = () => {
        onChange(tempValue)
        setIsOpen(false)
    }

    const handleClear = () => {
        onClear()
        setIsOpen(false)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className="group/rating flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Star className={`h-3 w-3 ${value ? "fill-yellow-400 text-yellow-400" : "text-white/70"}`} />
                    {value ? (
                        <span>{value}</span>
                    ) : (
                        <span className="hidden group-hover/rating:inline text-[10px]">Rate</span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" side={side} onClick={(e) => e.stopPropagation()}>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium leading-none">Your Rating</h4>
                        <span className="text-sm font-bold text-primary">{tempValue > 0 ? tempValue : '-'}</span>
                    </div>

                    <Slider
                        defaultValue={[tempValue]}
                        max={10}
                        step={0.5}
                        value={[tempValue]}
                        onValueChange={(vals) => setTempValue(vals[0])}
                        className="py-1"
                    />

                    <div className="flex items-center justify-between pt-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                        <Button size="sm" className="h-7 px-3 text-xs" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

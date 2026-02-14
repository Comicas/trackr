import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BentoSectionProps {
  title: ReactNode
  accentColor: string
  children: ReactNode
  className?: string
}

export function BentoSection({ title, accentColor, children, className }: BentoSectionProps) {
  return (
    <div className={cn("flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden text-card-foreground", className)}>
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border/50 shrink-0">
        <div className={`h-2 w-2 rounded-full ${accentColor}`} />
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex-1 flex items-center justify-between">
          {title}
        </div>
      </div>
      <div className="flex-1 px-3 py-3 overflow-hidden text-sm">
        {children}
      </div>
    </div>
  )
}

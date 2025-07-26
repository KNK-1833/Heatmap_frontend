"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CalendarProps {
  className?: string
  selected?: Date
  onSelect?: (date: Date) => void
}

export function Calendar({ className, selected, onSelect }: CalendarProps) {
  return (
    <div className={cn("p-3", className)}>
      <input
        type="date"
        className="w-full p-2 border rounded"
        value={selected ? selected.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          const date = new Date(e.target.value)
          onSelect?.(date)
        }}
      />
    </div>
  )
}
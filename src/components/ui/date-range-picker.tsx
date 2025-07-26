"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  value?: { from: Date; to: Date }
  onChange?: (range: { from: Date; to: Date }) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {formatDate(value.from)} - {formatDate(value.to)}
                </>
              ) : (
                formatDate(value.from)
              )
            ) : (
              <span>日付範囲を選択</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">開始日を選択</p>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={value?.from ? value.from.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = new Date(e.target.value)
                  if (onChange && value) {
                    onChange({ ...value, from: date })
                  }
                }}
              />
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground">終了日を選択</p>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={value?.to ? value.to.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = new Date(e.target.value)
                  if (onChange && value) {
                    onChange({ ...value, to: date })
                  }
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
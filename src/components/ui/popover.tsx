"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface PopoverTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface PopoverContentProps {
  children: React.ReactNode
  className?: string
  align?: "start" | "center" | "end"
}

const PopoverContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {}
})

export function Popover({ children, open: controlledOpen, onOpenChange }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ asChild, children }: PopoverTriggerProps) {
  const { open, setOpen } = React.useContext(PopoverContext)
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setOpen(!open)
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <button onClick={() => setOpen(!open)}>
      {children}
    </button>
  )
}

export function PopoverContent({ children, className, align = "center" }: PopoverContentProps) {
  const { open } = React.useContext(PopoverContext)

  if (!open) return null

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0"
  }

  return (
    <div className={cn(
      "absolute top-full mt-2 z-50 bg-white border rounded-md shadow-md",
      alignmentClasses[align],
      className
    )}>
      {children}
    </div>
  )
}
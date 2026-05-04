"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date?: Date
    onChange: (date?: Date) => void
    disabled?: boolean | ((date: Date) => boolean)
    className?: string
    placeholder?: string
}

export function DatePicker({
    date,
    onChange,
    disabled,
    className,
    placeholder = "Pick a date",
}: DatePickerProps) {
    // Determine if the button should be disabled (boolean only)
    const isButtonDisabled = typeof disabled === 'boolean' ? disabled : false
    // Determine the date matcher for the calendar
    const disabledDates = typeof disabled === 'function' ? disabled : undefined

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        className
                    )}
                    disabled={isButtonDisabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={onChange}
                    disabled={disabledDates}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

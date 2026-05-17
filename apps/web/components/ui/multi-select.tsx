"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface Option {
    label: string
    value: string
}

interface MultiSelectProps {
    options: Option[]
    selected: string[]
    onChange: (values: string[]) => void
    placeholder?: string
    creatable?: boolean
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    creatable = true,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const handleUnselect = (item: string) => {
        onChange(selected.filter((i) => i !== item))
    }

    const handleSelect = (value: string) => {
        if (selected.includes(value)) {
            handleUnselect(value)
        } else {
            onChange([...selected, value])
        }
        setInputValue("")
    }

    const handleCreate = () => {
        if (!inputValue) return
        if (!selected.includes(inputValue)) {
            onChange([...selected, inputValue])
        }
        setInputValue("")
    }

    const filteredOptions = options.filter(
        (option) => !selected.includes(option.value)
    )

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1">
                {selected.map((item) => (
                    <Badge
                        key={item}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1 text-[10px]"
                    >
                        {item}
                        <button
                            type="button"
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleUnselect(item)
                                }
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                            }}
                            onClick={() => handleUnselect(item)}
                        >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                    </Badge>
                ))}
            </div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="h-10 w-full justify-between font-normal text-muted-foreground hover:text-foreground bg-background"
                    >
                        <span className="truncate">
                            {selected.length > 0 ? `${selected.length} selected` : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command className="w-full">
                        <CommandInput
                            placeholder="Search labels..."
                            value={inputValue}
                            onValueChange={setInputValue}
                        />
                        <CommandList>
                            <CommandEmpty className="py-2 px-4 text-sm flex flex-col gap-2">
                                <span>No labels found.</span>
                                {creatable && inputValue && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="w-full justify-start h-8 px-2 text-xs"
                                        onClick={handleCreate}
                                    >
                                        <Plus className="mr-2 h-3 w-3" />
                                        Create "{inputValue}"
                                    </Button>
                                )}
                            </CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-auto">
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={() => handleSelect(option.value)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selected.includes(option.value)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

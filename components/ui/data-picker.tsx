"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format, isAfter } from "date-fns";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  // Initialize with dates that are within the valid range (not in the future)
  // Get current date for date boundary
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of day
  
  // Set default date range to recent past dates that won't exceed today
  const defaultTo = new Date();
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 14); // 14 days ago
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: defaultFrom,
    to: defaultTo,
  });

  // Custom date selection handler to enforce the restriction
  const handleSelect = (selectedRange: DateRange | undefined) => {
    // If no date selected or if either date is in the future, don't update
    if (!selectedRange) {
      setDate(undefined);
      return;
    }
    
    // Create a new range with valid dates
    const newRange: DateRange = {
      from: selectedRange.from,
      to: selectedRange.to
    };
    
    // Check if selected dates are in the future and adjust if needed
    if (selectedRange.from && isAfter(selectedRange.from, today)) {
      return; // Don't allow future start dates
    }
    
    if (selectedRange.to && isAfter(selectedRange.to, today)) {
      newRange.to = today; // Cap end date to today
    }
    
    setDate(newRange);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[270px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={(day) => isAfter(day, today)}
            modifiers={{ disabled: [(day) => isAfter(day, today)] }}
            modifiersStyles={{ disabled: { color: "#ccc", cursor: "not-allowed" } }}
            captionLayout="dropdown-buttons"
            fromYear={2022}
            toYear={today.getFullYear()}
            toDate={today}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

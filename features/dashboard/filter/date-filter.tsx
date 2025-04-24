"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format, isAfter } from "date-fns";
import * as React from "react";
import { DateRange } from "react-day-picker";
import { parseDate } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface DateFilterProps {
  limited?: boolean;
}

export const DateFilter = ({ limited = false }: DateFilterProps) => {
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  
  // Create a date reference for today to use in multiple places
  const today = new Date();

  // Function to get default date range based on limitations
  const getDefaultDateRange = (): DateRange => {
    const defaultDays = limited ? 27 : 31;
    const lastDays = new Date(today);
    lastDays.setDate(today.getDate() - defaultDays);
    // Return complete DateRange with defined from and to dates
    return { from: lastDays, to: today };
  };

  // Custom date selection handler to prevent future date selection
  const handleDateSelect = (selectedRange: DateRange | undefined) => {
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

  // Use useEffect for client-side initialization to avoid hydration mismatch
  React.useEffect(() => {
    setIsClient(true);
    
    const params = new URLSearchParams(window.location.search);
    const startDate = parseDate(params.get('startDate'));
    const endDate = parseDate(params.get('endDate'));
    
    if (startDate && endDate) {
      // Ensure dates don't exceed today
      const validEndDate = isAfter(endDate, today) ? today : endDate;
      setDate({ from: startDate, to: validEndDate });
    } else {
      setDate(getDefaultDateRange());
    }
  }, [limited]);

  const applyFilters = () => {
    if (date?.from && date?.to) {
      const formatEndDate = format(date.to, "yyyy-MM-dd");
      const formatStartDate = format(date.from, "yyyy-MM-dd");

      router.push(`?startDate=${formatStartDate}&endDate=${formatEndDate}`, {
        scroll: false,
      });
      router.refresh();
      setIsOpen(false);
    }
  };

  const resetFilters = () => {    
    // Reset the local state to default dates
    const defaultRange = getDefaultDateRange();
    setDate(defaultRange);
    
    // Format the default dates for URL parameters - ensure dates are defined
    const formatEndDate = format(defaultRange.to as Date, "yyyy-MM-dd");
    const formatStartDate = format(defaultRange.from as Date, "yyyy-MM-dd");
    
    // Update the URL with the default date range
    router.push(`?startDate=${formatStartDate}&endDate=${formatEndDate}`, {
      scroll: false,
    });
    router.refresh();
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2")}>
      <Popover open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isClient && date?.from ? (
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
        <PopoverContent
          className="w-auto p-0 flex gap-2 flex-col"
          align="start"
        >
          {isClient && date && (
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              disabled={(day) => {
                // Disable future dates
                if (isAfter(day, today)) return true;
                
                // Also apply the limited restriction if needed
                if (limited) {
                  const minDate = new Date(today);
                  minDate.setDate(today.getDate() - 27);
                  return day < minDate;
                }
                
                return false;
              }}
              toDate={today} // Set maximum date to today
            />
          )}
          <div className="flex justify-between m-2 gap-2">
            <Button 
              onClick={resetFilters} 
              variant="outline"
            >
              Reset
            </Button>
            <Button onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

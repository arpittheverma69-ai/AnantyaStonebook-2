import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";

interface CustomCalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomCalendar({ selectedDate, onDateSelect, placeholder = "Select date", className = "" }: CustomCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  // Update currentMonth when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    // Create a new date without time components to avoid timezone issues
    const selectedDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    console.log('Calendar: Original date clicked:', date);
    console.log('Calendar: Date only (no time):', selectedDateOnly);
    console.log('Calendar: Formatted date:', format(selectedDateOnly, "PPP"));
    console.log('Calendar: Year:', selectedDateOnly.getFullYear());
    console.log('Calendar: Month:', selectedDateOnly.getMonth());
    console.log('Calendar: Day:', selectedDateOnly.getDate());
    
    // Alternative approach - create date from string
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const alternativeDate = new Date(dateString);
    console.log('Calendar: Alternative date from string:', alternativeDate);
    console.log('Calendar: Alternative formatted:', format(alternativeDate, "PPP"));
    
    // Try UTC approach
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    console.log('Calendar: UTC date:', utcDate);
    console.log('Calendar: UTC formatted:', format(utcDate, "PPP"));
    
    // Fix: Use local date without timezone conversion
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    console.log('Calendar: Local date (noon):', localDate);
    console.log('Calendar: Local date formatted:', format(localDate, "PPP"));
    console.log('Calendar: Local date ISO:', localDate.toISOString());
    
    onDateSelect(localDate);
    setIsOpen(false);
  };

  const handleInputClick = () => {
    setIsOpen(!isOpen);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.custom-calendar')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`custom-calendar relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={selectedDate ? format(selectedDate, "PPP") : ""}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md cursor-pointer pr-10"
          onClick={handleInputClick}
        />
        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-[999999] min-w-[280px]">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-sm font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="p-3">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="text-xs text-muted-foreground text-center font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);

                return (
                  <Button
                    key={day.toString()}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs ${
                      !isCurrentMonth ? "text-muted-foreground opacity-50" : ""
                    } ${
                      isCurrentDay && !isSelected ? "bg-muted" : ""
                    }`}
                    onClick={() => handleDateClick(day)}
                  >
                    {format(day, "d")}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between p-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                onDateSelect(todayOnly);
                setIsOpen(false);
              }}
              className="text-xs"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";

interface CustomTimePickerProps {
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomTimePicker({ selectedTime, onTimeSelect, placeholder = "Select time", className = "" }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  // Initialize with selected time and update when selectedTime changes
  useEffect(() => {
    if (selectedTime) {
      // Handle 24-hour format (HH:MM)
      const [h, m] = selectedTime.split(':').map(Number);
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      setHours(displayHour);
      setMinutes(m);
      setPeriod(h >= 12 ? 'PM' : 'AM');
    } else {
      // Default to current time
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      setHours(displayHour);
      setMinutes(m);
      setPeriod(h >= 12 ? 'PM' : 'AM');
    }
  }, [selectedTime]);

  const handleTimeSelect = () => {
    const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : period === 'AM' && hours === 12 ? 0 : hours;
    const timeString = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onTimeSelect(timeString);
    setIsOpen(false);
  };

  const handleInputClick = () => {
    setIsOpen(!isOpen);
  };

  const incrementHours = () => {
    setHours(prev => prev === 12 ? 1 : prev + 1);
  };

  const decrementHours = () => {
    setHours(prev => prev === 1 ? 12 : prev - 1);
  };

  const incrementMinutes = () => {
    setMinutes(prev => prev === 59 ? 0 : prev + 1);
  };

  const decrementMinutes = () => {
    setMinutes(prev => prev === 0 ? 59 : prev - 1);
  };

  const togglePeriod = () => {
    setPeriod(prev => prev === 'AM' ? 'PM' : 'AM');
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.custom-time-picker')) {
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

  const formatDisplayTime = () => {
    if (selectedTime) {
      const [h, m] = selectedTime.split(':').map(Number);
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const period = h >= 12 ? 'PM' : 'AM';
      return `${displayHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
    }
    return "";
  };

  return (
    <div className={`custom-time-picker relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={formatDisplayTime()}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md cursor-pointer pr-10"
          onClick={handleInputClick}
        />
        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-[999999] min-w-[200px]">
          {/* Time Picker Header */}
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-semibold text-center">Select Time</h3>
          </div>

          {/* Time Display */}
          <div className="p-4">
            <div className="flex items-center justify-center space-x-4">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={incrementHours}
                  className="h-6 w-6 p-0 mb-1"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <div className="text-2xl font-bold min-w-[3rem] text-center">
                  {hours.toString().padStart(2, '0')}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={decrementHours}
                  className="h-6 w-6 p-0 mt-1"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>

              {/* Separator */}
              <div className="text-2xl font-bold">:</div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={incrementMinutes}
                  className="h-6 w-6 p-0 mb-1"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <div className="text-2xl font-bold min-w-[3rem] text-center">
                  {minutes.toString().padStart(2, '0')}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={decrementMinutes}
                  className="h-6 w-6 p-0 mt-1"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>

              {/* AM/PM */}
              <div className="flex flex-col items-center ml-4">
                <Button
                  variant={period === 'AM' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={togglePeriod}
                  className="h-6 px-2 mb-1 text-xs"
                >
                  AM
                </Button>
                <Button
                  variant={period === 'PM' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={togglePeriod}
                  className="h-6 px-2 mt-1 text-xs"
                >
                  PM
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Time Buttons */}
          <div className="p-3 border-t border-border">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['09:00', '12:00', '15:00'].map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const [h, m] = time.split(':').map(Number);
                    setHours(h > 12 ? h - 12 : h === 0 ? 12 : h);
                    setMinutes(m);
                    setPeriod(h >= 12 ? 'PM' : 'AM');
                  }}
                  className="text-xs"
                >
                  {time}
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const h = now.getHours();
                  const m = now.getMinutes();
                  setHours(h > 12 ? h - 12 : h === 0 ? 12 : h);
                  setMinutes(m);
                  setPeriod(h >= 12 ? 'PM' : 'AM');
                }}
                className="text-xs"
              >
                Now
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleTimeSelect}
                  className="text-xs"
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

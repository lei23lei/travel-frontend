"use client";

import { useState, useRef, useEffect } from "react";
import HomeBackground from "@/components/layout/home-bg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar } from "lucide-react";

export default function Home() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectionMode, setSelectionMode] = useState<"start" | "end">("start");
  const calendarRef = useRef<HTMLDivElement>(null);

  // Generate calendar days for current and next month
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Generate next month days
  const generateNextMonthDays = (date: Date) => {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return generateCalendarDays(nextMonth);
  };

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];

    if (selectionMode === "start") {
      setStartDate(dateString);
      setSelectionMode("end");
    } else {
      // If end date is before start date, swap them
      if (new Date(dateString) < new Date(startDate)) {
        setEndDate(startDate);
        setStartDate(dateString);
      } else {
        setEndDate(dateString);
      }
      setShowCalendar(false);
      setSelectionMode("start");
    }
  };

  const isDateSelected = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return dateString === startDate || dateString === endDate;
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    const dateString = date.toISOString().split("T")[0];
    return dateString >= startDate && dateString <= endDate;
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(
        endDate
      ).toLocaleDateString()}`;
    } else if (startDate) {
      return `${new Date(startDate).toLocaleDateString()} - Select end date`;
    }
    return "Select travel dates";
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const currentMonthDays = generateCalendarDays(currentMonth);
  const nextMonthDays = generateNextMonthDays(currentMonth);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
        setSelectionMode("start");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <HomeBackground>
      <div className="-mt-28 flex flex-col items-center justify-center max-h-screen px-4">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <div className="flex flex-row gap-4 items-center justify-center mb-4">
            <h2 className="text-white">Travel</h2>
            <h2 className="text-primary">Adventure</h2>
          </div>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl">
            Discover amazing destinations and create unforgettable memories
          </p>
        </div>

        {/* Search Form */}
        <Card className="w-full max-w-4xl liquid-glass-heavy">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Destination Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-authtext mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Destination
                </label>
                <Input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-white border-white/20 focus:border-primary/50"
                />
              </div>

              {/* Date Range Picker */}
              <div className="md:col-span-2 relative" ref={calendarRef}>
                <label className="block text-sm font-medium text-authtext mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Travel Dates
                </label>
                <Button
                  variant="outline"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full bg-white rounded-2xl border-white/20 focus:border-primary/50 text-left justify-start"
                >
                  {formatDateRange()}
                </Button>

                {/* Calendar Popup */}
                {showCalendar && (
                  <div className="absolute  top-full w-[600px] left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 p-4">
                    {/* Two Month Calendar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Current Month */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-semibold text-gray-900">
                            {monthNames[currentMonth.getMonth()]}{" "}
                            {currentMonth.getFullYear()}
                          </h6>
                        </div>

                        {/* Week Days */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {weekDays.map((day) => (
                            <div
                              key={day}
                              className="text-xs text-gray-500 text-center py-2"
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                          {currentMonthDays.map((day, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                day && !isDatePast(day) && handleDateClick(day)
                              }
                              disabled={!day || isDatePast(day)}
                              className={`
                                w-8 h-8 text-sm rounded-full flex items-center justify-center
                                ${!day ? "cursor-default" : ""}
                                ${
                                  day && isDatePast(day)
                                    ? "text-gray-300 cursor-not-allowed"
                                    : ""
                                }
                                ${
                                  day && !isDatePast(day)
                                    ? "hover:bg-primary/20 cursor-pointer"
                                    : ""
                                }
                                ${
                                  day && isDateSelected(day)
                                    ? "bg-primary text-white"
                                    : ""
                                }
                                ${
                                  day &&
                                  isDateInRange(day) &&
                                  !isDateSelected(day)
                                    ? "bg-primary/10"
                                    : ""
                                }
                              `}
                            >
                              {day?.getDate()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Next Month */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-semibold text-gray-900">
                            {monthNames[(currentMonth.getMonth() + 1) % 12]}{" "}
                            {currentMonth.getMonth() === 11
                              ? currentMonth.getFullYear() + 1
                              : currentMonth.getFullYear()}
                          </h6>
                        </div>

                        {/* Week Days */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {weekDays.map((day) => (
                            <div
                              key={day}
                              className="text-xs text-gray-500 text-center py-2"
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                          {nextMonthDays.map((day, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                day && !isDatePast(day) && handleDateClick(day)
                              }
                              disabled={!day || isDatePast(day)}
                              className={`
                                w-8 h-8 text-sm rounded-full flex items-center justify-center
                                ${!day ? "cursor-default" : ""}
                                ${
                                  day && isDatePast(day)
                                    ? "text-gray-300 cursor-not-allowed"
                                    : ""
                                }
                                ${
                                  day && !isDatePast(day)
                                    ? "hover:bg-primary/20 cursor-pointer"
                                    : ""
                                }
                                ${
                                  day && isDateSelected(day)
                                    ? "bg-primary text-white"
                                    : ""
                                }
                                ${
                                  day &&
                                  isDateInRange(day) &&
                                  !isDateSelected(day)
                                    ? "bg-primary/10"
                                    : ""
                                }
                              `}
                            >
                              {day?.getDate()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <Button
                variant="glass"
                className=" px-6 mt-[25px] py-2 hover:scale-105 transition-transform duration-300"
              >
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </HomeBackground>
  );
}

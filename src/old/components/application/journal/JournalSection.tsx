"use client";

import { useState } from "react";
import { Journal } from "./Journal";

export const JournalSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="h-full w-full">
      <Journal selectedDate={selectedDate} onDateChange={handleDateChange} />
    </div>
  );
};

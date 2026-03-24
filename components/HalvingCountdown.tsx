"use client";

import { useEffect, useState } from "react";

const TARGET_DATE = new Date("2029-06-01T00:00:00Z").getTime();

function getTimeLeft() {
  const diff = Math.max(0, TARGET_DATE - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function HalvingCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {units.map(({ value, label }) => (
        <div
          key={label}
          className="bg-[#0f1623] rounded-xl border border-amber-500/25 p-4 sm:p-6 text-center"
        >
          <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-amber-400 tabular-nums leading-none">
            {String(value).padStart(2, "0")}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2 uppercase tracking-widest">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

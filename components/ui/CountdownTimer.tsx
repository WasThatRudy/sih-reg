"use client";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  dueDate: string;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function CountdownTimer({
  dueDate,
  onExpire,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(dueDate).getTime() - new Date().getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          total: difference,
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        });

        if (onExpire) {
          onExpire();
        }
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [dueDate, onExpire]);

  // If time has expired
  if (timeLeft.total <= 0) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Deadline Passed</span>
      </div>
    );
  }

  // Determine if we're in the danger zone (less than 24 hours)
  const isDangerZone = timeLeft.total < 24 * 60 * 60 * 1000;
  const isWarningZone = timeLeft.total < 3 * 24 * 60 * 60 * 1000; // Less than 3 days

  const getColorClass = () => {
    if (isDangerZone) return "text-red-400";
    if (isWarningZone) return "text-yellow-400";
    return "text-green-400";
  };

  const formatTimeUnit = (value: number, unit: string) => {
    if (value === 0) return null;
    return `${value} ${unit}${value !== 1 ? "s" : ""}`;
  };

  const timeString = [
    formatTimeUnit(timeLeft.days, "day"),
    formatTimeUnit(timeLeft.hours, "hour"),
    formatTimeUnit(timeLeft.minutes, "minute"),
  ]
    .filter(Boolean)
    .join(", ");

  // For very short timeframes, show seconds too
  const shortTimeString =
    isDangerZone && timeLeft.days === 0 && timeLeft.hours === 0
      ? [
          formatTimeUnit(timeLeft.minutes, "minute"),
          formatTimeUnit(timeLeft.seconds, "second"),
        ]
          .filter(Boolean)
          .join(", ")
      : timeString;

  return (
    <div className={`flex items-center gap-2 ${getColorClass()}`}>
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">
        {shortTimeString || "Less than a minute"} remaining
      </span>
    </div>
  );
}

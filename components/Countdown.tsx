"use client";

import { useEffect, useState } from "react";

function remaining(target: number) {
  const seconds = Math.max(0, Math.floor((target - Date.now()) / 1000));
  return { days: Math.floor(seconds / 86400), hours: Math.floor((seconds % 86400) / 3600), minutes: Math.floor((seconds % 3600) / 60), seconds: seconds % 60, expired: seconds === 0 };
}

export default function Countdown({ date, time }: { date: string; time?: string | null }) {
  const target = Date.parse(`${date}T${time || "00:00:00"}+01:00`);
  const [value, setValue] = useState(() => remaining(target));
  useEffect(() => { const timer = window.setInterval(() => setValue(remaining(target)), 1000); return () => window.clearInterval(timer); }, [target]);
  if (value.expired) return <p className="countdown expired">Event time has passed</p>;
  return <div className="countdown" aria-label="Countdown to event"><span><strong>{value.days}</strong>days</span><span><strong>{String(value.hours).padStart(2, "0")}</strong>hours</span><span><strong>{String(value.minutes).padStart(2, "0")}</strong>minutes</span><span><strong>{String(value.seconds).padStart(2, "0")}</strong>seconds</span></div>;
}

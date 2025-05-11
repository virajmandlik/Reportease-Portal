import React, { useEffect, useState } from "react";

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get the time in IST
  const getISTTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // 24-hour format
    }).formatToParts(date);
  };

  const istTimeParts = getISTTime(time);
  const hours = istTimeParts.find((part) => part.type === "hour")?.value || "00";
  const minutes = istTimeParts.find((part) => part.type === "minute")?.value || "00";
  const seconds = istTimeParts.find((part) => part.type === "second")?.value || "00";

  return (
    <div className="coming-time custom-countdown-two">
      <div className="time-count day">
        <span>{hours}</span>hour
      </div>
      <div className="time-count min">
        <span>{minutes}</span>minute
      </div>
      <div className="time-count sec">
        <span>{seconds}</span>second
      </div>
    </div>
  );
};

export default Clock;

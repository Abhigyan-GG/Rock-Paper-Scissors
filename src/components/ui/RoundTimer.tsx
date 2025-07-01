import React, { useEffect, useState } from "react";

interface RoundTimerProps {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  onTimeUp?: () => void;
  size?: "small" | "medium" | "large";
}

const RoundTimer: React.FC<RoundTimerProps> = ({
  timeLeft,
  totalTime,
  isActive,
  onTimeUp,
  size = "medium",
}) => {
  const [previousTime, setPreviousTime] = useState(timeLeft);
  const [isWarning, setIsWarning] = useState(false);
  const [isDanger, setIsDanger] = useState(false);

  const sizeClasses = {
    small: { container: "w-16 h-16", text: "text-lg", ring: "w-20 h-20" },
    medium: { container: "w-24 h-24", text: "text-2xl", ring: "w-28 h-28" },
    large: { container: "w-32 h-32", text: "text-4xl", ring: "w-36 h-36" },
  };

  const classes = sizeClasses[size];

  useEffect(() => {
    // Trigger warning state
    if (timeLeft <= 5 && timeLeft > 3) {
      setIsWarning(true);
      setIsDanger(false);
    } else if (timeLeft <= 3) {
      setIsWarning(false);
      setIsDanger(true);
    } else {
      setIsWarning(false);
      setIsDanger(false);
    }

    // Call onTimeUp when time reaches 0
    if (timeLeft === 0 && previousTime > 0 && onTimeUp) {
      onTimeUp();
    }

    setPreviousTime(timeLeft);
  }, [timeLeft, previousTime, onTimeUp]);

  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getTimerColor = () => {
    if (isDanger) return "text-red-400";
    if (isWarning) return "text-yellow-400";
    return "text-green-400";
  };

  const getRingColor = () => {
    if (isDanger) return "#EF4444";
    if (isWarning) return "#F59E0B";
    return "#10B981";
  };

  const getGlowColor = () => {
    if (isDanger) return "shadow-red-400/50";
    if (isWarning) return "shadow-yellow-400/50";
    return "shadow-green-400/50";
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated background ring */}
      <div
        className={`absolute ${classes.ring} ${getGlowColor()} ${isDanger ? "animate-pulse" : ""}`}
      >
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="4"
            fill="transparent"
          />

          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={getRingColor()}
            strokeWidth="4"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-out"
            style={{
              filter: isDanger ? "drop-shadow(0 0 8px currentColor)" : "none",
            }}
          />
        </svg>
      </div>

      {/* Timer display */}
      <div
        className={`relative ${classes.container} flex items-center justify-center`}
      >
        <div
          className={`
          ${classes.text} font-bold ${getTimerColor()} transition-all duration-300
          ${isDanger ? "animate-pulse scale-110" : ""}
          ${isWarning ? "animate-bounce" : ""}
        `}
        >
          {timeLeft}
        </div>
      </div>

      {/* Pulse effect for danger state */}
      {isDanger && (
        <div className={`absolute ${classes.ring} animate-ping opacity-75`}>
          <div className="w-full h-full rounded-full bg-red-400/20"></div>
        </div>
      )}

      {/* Warning indicators */}
      {isWarning && (
        <div className="absolute -top-2 -right-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      )}

      {isDanger && (
        <div className="absolute -top-2 -right-2">
          <div className="w-4 h-4 bg-red-400 rounded-full animate-bounce"></div>
        </div>
      )}

      {/* Time's up effect */}
      {timeLeft === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-red-500 text-xs font-bold animate-pulse">
            TIME'S UP!
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundTimer;

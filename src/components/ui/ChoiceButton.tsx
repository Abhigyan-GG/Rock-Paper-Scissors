import React, { useState } from "react";
import { Choice } from "../../types";
import { soundManager } from "../../utils/soundManager";

interface ChoiceButtonProps {
  choice: Choice;
  onClick: (choice: Choice) => void;
  disabled?: boolean;
  isSelected?: boolean;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  choice,
  onClick,
  disabled = false,
  isSelected = false,
  size = "large",
  showLabel = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const sizeClasses = {
    small: "p-4 text-3xl",
    medium: "p-6 text-4xl",
    large: "p-8 text-6xl",
  };

  const handleClick = async (e: React.MouseEvent) => {
    if (disabled) return;

    // Sound effect
    await soundManager.playChoice();

    // Visual feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    // Particle explosion effect
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: centerX + (Math.random() - 0.5) * 40,
      y: centerY + (Math.random() - 0.5) * 40,
    }));

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    onClick(choice);
  };

  const getChoiceColor = () => {
    switch (choice.id) {
      case "rock":
        return "from-gray-500 to-gray-700";
      case "paper":
        return "from-blue-500 to-blue-700";
      case "scissors":
        return "from-red-500 to-red-700";
      default:
        return "from-purple-500 to-purple-700";
    }
  };

  const getChoiceHoverColor = () => {
    switch (choice.id) {
      case "rock":
        return "from-gray-400 to-gray-600";
      case "paper":
        return "from-blue-400 to-blue-600";
      case "scissors":
        return "from-red-400 to-red-600";
      default:
        return "from-purple-400 to-purple-600";
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative overflow-hidden backdrop-blur-xl rounded-3xl border-2 transition-all duration-300 transform
          ${sizeClasses[size]}
          ${
            disabled
              ? "opacity-50 cursor-not-allowed border-white/20 bg-white/5"
              : "cursor-pointer border-white/30 bg-white/10 hover:bg-white/20 hover:border-white/50 hover:scale-105"
          }
          ${
            isSelected
              ? "border-yellow-400 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 scale-110 shadow-2xl"
              : ""
          }
          ${isPressed ? "scale-95" : ""}
          group-hover:shadow-2xl
        `}
      >
        {/* Background gradient effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getChoiceColor()} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
        ></div>

        {/* Choice emoji with animation */}
        <div
          className={`
          relative z-10 transform transition-all duration-300
          ${disabled ? "" : "group-hover:scale-110 group-hover:rotate-12"}
          ${isSelected ? "animate-bounce" : ""}
        `}
        >
          {choice.emoji}
        </div>

        {/* Ripple effect */}
        {isPressed && (
          <div className="absolute inset-0 animate-ping">
            <div className="w-full h-full bg-white/20 rounded-3xl"></div>
          </div>
        )}

        {/* Particle effects */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping pointer-events-none"
            style={{
              left: particle.x,
              top: particle.y,
              animationDuration: "0.6s",
            }}
          />
        ))}

        {/* Glow effect for selected state */}
        {isSelected && (
          <div className="absolute inset-0 bg-yellow-400/20 rounded-3xl animate-pulse"></div>
        )}
      </button>

      {/* Choice name label */}
      {showLabel && (
        <div
          className={`
          text-center mt-3 transition-all duration-300
          ${disabled ? "text-white/40" : "text-white/80 group-hover:text-white"}
          ${isSelected ? "text-yellow-300 font-bold" : ""}
        `}
        >
          <div className="text-lg font-semibold">{choice.name}</div>
          {!disabled && (
            <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-300">
              Beats {choice.beats}
            </div>
          )}
        </div>
      )}

      {/* External glow effect */}
      <div
        className={`
        absolute inset-0 bg-gradient-to-br ${getChoiceHoverColor()} opacity-0 group-hover:opacity-30 blur-xl scale-110 transition-opacity duration-500 rounded-3xl -z-10
        ${isSelected ? "opacity-40 bg-gradient-to-br from-yellow-400 to-orange-400" : ""}
      `}
      ></div>
    </div>
  );
};

export default ChoiceButton;

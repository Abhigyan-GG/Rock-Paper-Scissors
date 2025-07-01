import React, { useState, useEffect } from "react";
import { GameMode } from "../../types";
import { soundManager } from "../../utils/soundManager";

interface ModeSelectorProps {
  onModeSelect: (mode: GameMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onModeSelect }) => {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleModeSelect = async (mode: GameMode) => {
    await soundManager.playButtonClick();
    onModeSelect(mode);
  };

  const handleMouseEnter = async (mode: string) => {
    setHoveredMode(mode);
    await soundManager.playTone(500, 0.05, "sine", 0.03);
  };

  const modes = [
    {
      id: "computer",
      title: "vs Computer",
      subtitle: "Challenge the AI",
      emoji: "🤖",
      gradient: "from-orange-500 to-red-500",
      hoverGradient: "from-orange-400 to-red-400",
      description: "Test your skills against our intelligent AI opponent",
      difficulty: "Easy to Hard",
    },
    {
      id: "twoPlayer",
      title: "Two Players",
      subtitle: "Local Multiplayer",
      emoji: "👥",
      gradient: "from-blue-500 to-purple-500",
      hoverGradient: "from-blue-400 to-purple-400",
      description: "Play with a friend on the same device",
      difficulty: "Social Fun",
    },
    {
      id: "multiplayer",
      title: "Online Battle",
      subtitle: "Real-time Multiplayer",
      emoji: "🌐",
      gradient: "from-green-500 to-teal-500",
      hoverGradient: "from-green-400 to-teal-400",
      description: "Battle players from around the world",
      difficulty: "Competitive",
      isNew: true,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Main title with animation */}
      <div
        className={`text-center mb-12 transform transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <div className="relative inline-block">
          <h1 className="text-7xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
            🪨📄✂️
          </h1>
          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-300/20 via-orange-400/20 to-red-400/20 blur-xl rounded-full animate-pulse"></div>
        </div>

        <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
          Rock Paper Scissors
        </h2>

        <p className="text-xl md:text-2xl text-white/80 mb-2">
          Choose your battlefield
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
      </div>

      {/* Mode selection cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {modes.map((mode, index) => (
          <div
            key={mode.id}
            className={`relative group transform transition-all duration-700 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 200}ms` }}
            onMouseEnter={() => handleMouseEnter(mode.id)}
            onMouseLeave={() => setHoveredMode(null)}
          >
            {/* Card background with glassmorphism */}
            <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden">
              {/* Animated background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl`}
              ></div>

              {/* New badge */}
              {mode.isNew && (
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-3 py-1 rounded-full font-bold animate-bounce shadow-lg">
                    NEW
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10">
                {/* Emoji with animation */}
                <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  {mode.emoji}
                </div>

                {/* Title and subtitle */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                  {mode.title}
                </h3>
                <p className="text-white/60 text-sm mb-4 group-hover:text-white/80 transition-colors duration-300">
                  {mode.subtitle}
                </p>

                {/* Description */}
                <p className="text-white/80 text-sm mb-4 leading-relaxed">
                  {mode.description}
                </p>

                {/* Difficulty indicator */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs text-white/60">Difficulty:</span>
                  <span className="text-xs text-purple-300 font-semibold">
                    {mode.difficulty}
                  </span>
                </div>

                {/* Action button */}
                <button
                  onClick={() => handleModeSelect(mode.id as GameMode)}
                  className={`w-full bg-gradient-to-r ${mode.gradient} hover:${mode.hoverGradient} text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl shadow-lg`}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Play Now</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </button>
              </div>

              {/* Hover effect particles */}
              {hoveredMode === mode.id && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full opacity-60 animate-ping"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${i * 100}ms`,
                        animationDuration: "1s",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* External glow effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-30 blur-2xl scale-110 transition-opacity duration-500 rounded-3xl -z-10`}
            ></div>
          </div>
        ))}
      </div>

      {/* Bottom decorative elements */}
      <div className="flex justify-center mt-16 space-x-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;

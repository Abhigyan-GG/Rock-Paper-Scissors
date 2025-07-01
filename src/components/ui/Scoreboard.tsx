import React, { useEffect, useState } from "react";
import { GameMode, GameScore } from "../../types";

interface ScoreboardProps {
  score: GameScore;
  gameMode: GameMode;
  size?: "normal" | "large";
  animated?: boolean;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  score,
  gameMode,
  size = "normal",
  animated = true,
}) => {
  const [displayScore, setDisplayScore] = useState<GameScore>(score);
  const [scoreChanged, setScoreChanged] = useState<{
    player1: boolean;
    player2: boolean;
    computer: boolean;
  }>({
    player1: false,
    player2: false,
    computer: false,
  });

  const textSize = size === "large" ? "text-4xl" : "text-3xl";
  const nameSize = size === "large" ? "text-lg" : "text-sm";
  const padding = size === "large" ? "p-8" : "p-6";
  const gap = size === "large" ? "gap-16" : "gap-12";

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    // Animate score changes
    const changes = {
      player1: score.player1 !== displayScore.player1,
      player2: score.player2 !== displayScore.player2,
      computer: score.computer !== displayScore.computer,
    };

    if (changes.player1 || changes.player2 || changes.computer) {
      setScoreChanged(changes);

      // Animate the score update
      setTimeout(() => {
        setDisplayScore(score);
        setTimeout(() => {
          setScoreChanged({ player1: false, player2: false, computer: false });
        }, 500);
      }, 100);
    }
  }, [score, displayScore, animated]);

  const ScoreDisplay: React.FC<{
    value: number;
    label: string;
    color: string;
    glowColor: string;
    changed: boolean;
    emoji: string;
  }> = ({ value, label, color, glowColor, changed, emoji }) => (
    <div className="relative text-center group">
      {/* Background glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-20 rounded-2xl blur-xl scale-110 group-hover:opacity-40 transition-opacity duration-300`}
      ></div>

      {/* Score container */}
      <div
        className={`
        relative backdrop-blur-xl bg-white/10 rounded-2xl ${padding} border border-white/20 transition-all duration-300
        ${changed ? "animate-pulse border-yellow-400 bg-yellow-400/20" : ""}
        group-hover:bg-white/20 group-hover:border-white/40 group-hover:scale-105
      `}
      >
        {/* Player emoji and name */}
        <div className="flex items-center justify-center mb-3">
          <span className="text-2xl mr-2">{emoji}</span>
          <div
            className={`${nameSize} font-bold ${color} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
          >
            {label}
          </div>
        </div>

        {/* Score value */}
        <div
          className={`
          ${textSize} font-bold ${color} transition-all duration-300
          ${changed ? "animate-bounce text-yellow-400" : ""}
          group-hover:scale-110
        `}
        >
          {value}
        </div>

        {/* Score change indicator */}
        {changed && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold animate-bounce">
              +1
            </div>
          </div>
        )}

        {/* Winning indicator */}
        {size === "large" && value > 0 && (
          <div className="mt-2">
            {[...Array(value)].map((_, i) => (
              <span
                key={i}
                className="text-yellow-400 text-lg animate-pulse mr-1"
              >
                ⭐
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex justify-center">
      <div className={`flex ${gap} items-center`}>
        <ScoreDisplay
          value={displayScore.player1}
          label="Player 1"
          color="text-purple-300"
          glowColor="from-purple-500 to-purple-700"
          changed={scoreChanged.player1}
          emoji="🎮"
        />

        {/* VS indicator */}
        <div className="text-center px-4">
          <div className="text-4xl font-bold text-white/60 animate-pulse">
            VS
          </div>
          <div className="w-8 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto mt-2 rounded-full"></div>
        </div>

        <ScoreDisplay
          value={
            gameMode === "computer"
              ? displayScore.computer
              : displayScore.player2
          }
          label={gameMode === "computer" ? "Computer" : "Player 2"}
          color={gameMode === "computer" ? "text-red-300" : "text-blue-300"}
          glowColor={
            gameMode === "computer"
              ? "from-red-500 to-red-700"
              : "from-blue-500 to-blue-700"
          }
          changed={
            gameMode === "computer"
              ? scoreChanged.computer
              : scoreChanged.player2
          }
          emoji={gameMode === "computer" ? "🤖" : "🎯"}
        />
      </div>
    </div>
  );
};

export default Scoreboard;

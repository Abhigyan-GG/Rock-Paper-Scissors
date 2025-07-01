import React, { useEffect, useState } from "react";
import {
  GameMode,
  GameScore,
  Choice,
  GameResult as GameResultType,
} from "../../types";
import Scoreboard from "./Scoreboard";
import { soundManager } from "../../utils/soundManager";

interface GameResultProps {
  gameMode: GameMode;
  result: GameResultType;
  playerChoice: Choice | null;
  player2Choice: Choice | null;
  computerChoice: Choice | null;
  score: GameScore;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

const GameResult: React.FC<GameResultProps> = ({
  gameMode,
  result,
  playerChoice,
  player2Choice,
  computerChoice,
  score,
  onPlayAgain,
  onNewGame,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const sequence = async () => {
      setIsLoaded(true);

      // Show choices first
      setTimeout(() => setShowChoices(true), 300);

      // Then show result with sound
      setTimeout(() => {
        setShowResult(true);
        if (result === "tie") {
          soundManager.playTie();
        } else if (result === "player1") {
          soundManager.playWin();
        } else {
          soundManager.playLose();
        }
      }, 800);
    };

    sequence();
  }, [result]);

  const getResultMessage = (): string => {
    if (result === "tie") return "Epic Tie! 🤝";
    if (gameMode === "computer") {
      return result === "player1" ? "Victory! 🎉" : "AI Wins! 🤖";
    } else {
      return result === "player1" ? "Player 1 Wins! 🎉" : "Player 2 Wins! 🎉";
    }
  };

  const getResultEmoji = (): string => {
    if (result === "tie") return "🤝";
    if (gameMode === "computer") {
      return result === "player1" ? "🏆" : "🤖";
    } else {
      return result === "player1" ? "👑" : "🏆";
    }
  };

  const getResultColor = (): string => {
    if (result === "tie") return "from-yellow-400 to-orange-400";
    if (gameMode === "computer") {
      return result === "player1"
        ? "from-green-400 to-emerald-400"
        : "from-red-400 to-rose-400";
    } else {
      return result === "player1"
        ? "from-purple-400 to-pink-400"
        : "from-blue-400 to-cyan-400";
    }
  };

  const getOpponentChoice = () => {
    return gameMode === "computer" ? computerChoice : player2Choice;
  };

  const getOpponentName = () => {
    return gameMode === "computer" ? "Computer" : "Player 2";
  };

  const getOpponentEmoji = () => {
    return gameMode === "computer" ? "🤖" : "🎯";
  };

  const ChoiceDisplay: React.FC<{
    choice: Choice | null;
    playerName: string;
    emoji: string;
    color: string;
    isWinner: boolean;
    delay: number;
  }> = ({ choice, playerName, emoji, color, isWinner, delay }) => (
    <div
      className={`text-center transform transition-all duration-700 ${
        showChoices
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-10 opacity-0 scale-75"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Player info */}
      <div className="mb-6">
        <div className="text-3xl mb-2">{emoji}</div>
        <div
          className={`text-xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
        >
          {playerName}
        </div>
      </div>

      {/* Choice display */}
      <div className={`relative group ${isWinner ? "animate-pulse" : ""}`}>
        {/* Glow effect for winner */}
        {isWinner && (
          <div
            className={`absolute -inset-4 bg-gradient-to-r ${color} opacity-30 blur-xl rounded-full animate-pulse`}
          ></div>
        )}

        {/* Choice container */}
        <div
          className={`
          relative backdrop-blur-xl rounded-3xl p-12 border-4 transition-all duration-500
          ${
            isWinner
              ? `border-yellow-400 bg-yellow-400/20 scale-110`
              : "border-white/20 bg-white/10"
          }
        `}
        >
          <div
            className={`text-8xl transition-all duration-500 ${isWinner ? "animate-bounce" : ""}`}
          >
            {choice?.emoji}
          </div>

          {/* Winner crown */}
          {isWinner && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="text-4xl animate-bounce">👑</div>
            </div>
          )}
        </div>

        {/* Choice name */}
        <div className="mt-4">
          <div className="text-2xl font-bold text-white">{choice?.name}</div>
          <div className="text-sm text-white/60 mt-1">
            Beats {choice?.beats}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Result Message */}
      <div
        className={`text-center mb-12 transform transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <div className="relative inline-block">
          {/* Main result */}
          <div
            className={`
            text-7xl mb-6 transform transition-all duration-1000
            ${showResult ? "scale-100 opacity-100" : "scale-75 opacity-0"}
          `}
          >
            {getResultEmoji()}
          </div>

          <h1
            className={`
            text-6xl font-bold mb-4 bg-gradient-to-r ${getResultColor()} bg-clip-text text-transparent
            transform transition-all duration-1000 ${showResult ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}
          `}
          >
            {getResultMessage()}
          </h1>

          {/* Confetti effect for wins */}
          {showResult && result !== "tie" && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: [
                      "#F59E0B",
                      "#EF4444",
                      "#8B5CF6",
                      "#06B6D4",
                      "#10B981",
                    ][i % 5],
                    animationDelay: `${i * 100}ms`,
                    animationDuration: "2s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Choices Battle Display */}
      <div className="mb-12">
        <div className="flex justify-center items-center space-x-16">
          <ChoiceDisplay
            choice={playerChoice}
            playerName={gameMode === "computer" ? "You" : "Player 1"}
            emoji="🎮"
            color="from-purple-400 to-pink-400"
            isWinner={result === "player1"}
            delay={0}
          />

          {/* VS Indicator */}
          <div
            className={`
            text-center transform transition-all duration-700 
            ${showChoices ? "scale-100 opacity-100" : "scale-75 opacity-0"}
          `}
          >
            <div className="relative">
              <div className="text-6xl font-bold text-white/80 animate-pulse">
                VS
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 blur-xl"></div>
            </div>

            {/* Battle effect */}
            <div className="flex justify-center mt-4 space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>

          <ChoiceDisplay
            choice={getOpponentChoice()}
            playerName={getOpponentName()}
            emoji={getOpponentEmoji()}
            color={
              gameMode === "computer"
                ? "from-red-400 to-rose-400"
                : "from-blue-400 to-cyan-400"
            }
            isWinner={result === "player2"}
            delay={200}
          />
        </div>
      </div>

      {/* Updated Score */}
      <div
        className={`mb-12 transform transition-all duration-1000 delay-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <Scoreboard score={score} gameMode={gameMode} size="large" />
      </div>

      {/* Action Buttons */}
      <div
        className={`flex justify-center gap-6 transform transition-all duration-1000 delay-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <button
          onClick={onPlayAgain}
          className="group relative backdrop-blur-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-green-400/20"
        >
          <span className="flex items-center space-x-2">
            <span className="text-xl">🔄</span>
            <span>Play Again</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        <button
          onClick={onNewGame}
          className="group relative backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105"
        >
          <span className="flex items-center space-x-2">
            <span className="text-xl">🏠</span>
            <span>New Game</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-700/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Decorative elements */}
      <div className="fixed top-1/4 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
      <div className="fixed top-1/3 right-10 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-60"></div>
      <div className="fixed bottom-1/4 left-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce opacity-60"></div>
      <div className="fixed bottom-1/3 right-1/4 w-2.5 h-2.5 bg-blue-400 rounded-full animate-ping opacity-60"></div>
    </div>
  );
};

export default GameResult;

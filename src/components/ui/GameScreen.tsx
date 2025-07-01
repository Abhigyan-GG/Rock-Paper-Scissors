import React, { useState, useEffect } from "react";
import { GameMode, GameScore, Choice } from "../../types";
import { choices } from "../../utils/gameLogic";
import Scoreboard from "./Scoreboard";
import ChoiceButton from "./ChoiceButton";
import { soundManager } from "../../utils/soundManager";

interface GameScreenProps {
  gameMode: GameMode;
  currentPlayer: 1 | 2;
  score: GameScore;
  roundNumber: number;
  isRevealing: boolean;
  onChoice: (choice: Choice) => void;
  onBackToModeSelection: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  gameMode,
  currentPlayer,
  score,
  roundNumber,
  isRevealing,
  onChoice,
  onBackToModeSelection,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    soundManager.playGameStart();
  }, []);

  const handleChoice = async (choice: Choice) => {
    setSelectedChoice(choice);
    await soundManager.playChoice();
    onChoice(choice);
  };

  const getPlayerPrompt = () => {
    if (gameMode === "computer") {
      return "Choose your weapon and challenge the AI!";
    }
    return currentPlayer === 1
      ? "Player 1's turn - Make your choice!"
      : "Player 2's turn - Choose wisely!";
  };

  const getPlayerColor = () => {
    if (gameMode === "computer") return "from-purple-400 to-pink-400";
    return currentPlayer === 1
      ? "from-purple-400 to-pink-400"
      : "from-blue-400 to-cyan-400";
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div
        className={`text-center mb-12 transform transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        {/* Round indicator */}
        <div className="relative inline-block mb-6">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl px-8 py-4 border border-white/20">
            <h1
              className={`text-5xl font-bold bg-gradient-to-r ${getPlayerColor()} bg-clip-text text-transparent`}
            >
              Round {roundNumber}
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-20 animate-pulse"></div>
          </div>
        </div>

        {/* Player prompt */}
        <p className="text-2xl text-white/90 mb-4 font-medium">
          {getPlayerPrompt()}
        </p>

        {/* Turn indicator for two-player mode */}
        {gameMode === "twoPlayer" && (
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div
              className={`w-4 h-4 rounded-full transition-all duration-300 ${currentPlayer === 1 ? "bg-purple-400 scale-125 animate-pulse" : "bg-white/20"}`}
            ></div>
            <span className="text-white/60">Player Turn</span>
            <div
              className={`w-4 h-4 rounded-full transition-all duration-300 ${currentPlayer === 2 ? "bg-blue-400 scale-125 animate-pulse" : "bg-white/20"}`}
            ></div>
          </div>
        )}
      </div>

      {/* Score Display */}
      <div
        className={`mb-12 transform transition-all duration-1000 delay-200 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <Scoreboard score={score} gameMode={gameMode} size="large" />
      </div>

      {/* Choice Buttons */}
      <div
        className={`mb-12 transform transition-all duration-1000 delay-400 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {choices.map((choice, index) => (
            <div
              key={choice.id}
              className={`transform transition-all duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              <ChoiceButton
                choice={choice}
                onClick={handleChoice}
                disabled={isRevealing || !!selectedChoice}
                isSelected={selectedChoice?.id === choice.id}
                size="large"
              />
            </div>
          ))}
        </div>

        {/* Loading state during reveal */}
        {isRevealing && (
          <div className="text-center mt-8">
            <div className="relative inline-block">
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl px-8 py-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                  <span className="text-xl text-white/90 font-medium">
                    Revealing results...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div
        className={`text-center transform transition-all duration-1000 delay-800 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <button
          onClick={onBackToModeSelection}
          className="group relative backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <span className="flex items-center space-x-2">
            <span className="group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            <span>Back to Mode Selection</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-700/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Decorative elements */}
      <div className="fixed top-1/4 left-10 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-60"></div>
      <div className="fixed top-1/3 right-10 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
      <div className="fixed bottom-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-bounce opacity-60"></div>
      <div className="fixed bottom-1/3 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
    </div>
  );
};

export default GameScreen;

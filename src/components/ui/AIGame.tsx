import React, { useState, useEffect } from "react";
import { Choice, GameScore, GameResult as GameResultType } from "../../types";
import {
  choices,
  getComputerChoice,
  determineWinner,
} from "../../utils/gameLogic";
import { soundManager } from "../../utils/soundManager";
import ChoiceButton from "./ChoiceButton";
import Scoreboard from "./Scoreboard";
import GameResult from "./GameResult";

interface AIGameProps {
  onBackToModeSelection: () => void;
}

const AIGame: React.FC<AIGameProps> = ({ onBackToModeSelection }) => {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<GameResultType>(null);
  const [score, setScore] = useState<GameScore>({
    player1: 0,
    player2: 0,
    computer: 0,
  });
  const [isRevealing, setIsRevealing] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gamePhase, setGamePhase] = useState<
    "choosing" | "revealing" | "result"
  >("choosing");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    try {
      soundManager.playGameStart();
    } catch (error) {
      console.warn("Sound failed:", error);
    }
  }, []);

  const handleChoice = async (choice: Choice) => {
    if (isRevealing || gamePhase !== "choosing") return;

    try {
      await soundManager.playChoice();
    } catch (error) {
      console.warn("Sound failed:", error);
    }

    // Set player choice and start revealing phase
    setPlayerChoice(choice);
    setGamePhase("revealing");
    setIsRevealing(true);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Step 1: Show "Thinking..." for AI (1 second)
    setTimeout(() => {
      // Step 2: Generate and show computer choice
      const compChoice = getComputerChoice();
      setComputerChoice(compChoice);

      // Step 3: After another pause, determine winner and show result
      setTimeout(() => {
        const winner = determineWinner(choice, compChoice);
        setResult(winner);

        // Update score
        if (winner === "player1") {
          setScore((prev) => ({ ...prev, player1: prev.player1 + 1 }));
          try {
            soundManager.playWin();
          } catch (e) {
            console.warn("Sound failed:", e);
          }
        } else if (winner === "player2") {
          setScore((prev) => ({ ...prev, computer: prev.computer + 1 }));
          try {
            soundManager.playLose();
          } catch (e) {
            console.warn("Sound failed:", e);
          }
        } else {
          try {
            soundManager.playTie();
          } catch (e) {
            console.warn("Sound failed:", e);
          }
        }

        setGamePhase("result");
        setIsRevealing(false);
      }, 1000);
    }, 1500);
  };

  const playAgain = () => {
    try {
      soundManager.playButtonClick();
    } catch (error) {
      console.warn("Sound failed:", error);
    }

    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setGamePhase("choosing");
    setRoundNumber((prev) => prev + 1);
  };

  const newGame = () => {
    try {
      soundManager.playButtonClick();
    } catch (error) {
      console.warn("Sound failed:", error);
    }

    onBackToModeSelection();
  };

  // Show result screen
  if (gamePhase === "result") {
    return (
      <GameResult
        gameMode="computer"
        result={result}
        playerChoice={playerChoice}
        player2Choice={null}
        computerChoice={computerChoice}
        score={score}
        onPlayAgain={playAgain}
        onNewGame={newGame}
      />
    );
  }

  // Main game screen
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div
        className={`text-center mb-12 transform transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        {/* Round indicator */}
        <div className="relative inline-block mb-6">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl px-8 py-4 border border-white/20">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Round {roundNumber}
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-20 animate-pulse"></div>
          </div>
        </div>

        {/* Game prompt */}
        <p className="text-2xl text-white/90 mb-4 font-medium">
          {gamePhase === "choosing"
            ? "Choose your weapon against the AI!"
            : gamePhase === "revealing"
              ? "AI is thinking..."
              : ""}
        </p>

        {/* AI thinking indicator */}
        {gamePhase === "revealing" && (
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="text-3xl animate-bounce">🤖</div>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Score Display */}
      <div
        className={`mb-12 transform transition-all duration-1000 delay-200 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <Scoreboard score={score} gameMode="computer" size="large" />
      </div>

      {/* Choices Section */}
      <div
        className={`mb-12 transform transition-all duration-1000 delay-400 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        {gamePhase === "revealing" && playerChoice && computerChoice ? (
          // Show both choices during reveal
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-8">
              Battle Results!
            </h3>
            <div className="flex justify-center items-center space-x-16">
              <div className="text-center">
                <div className="text-sm text-white/60 mb-2">You</div>
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                  <div className="text-8xl animate-bounce">
                    {playerChoice.emoji}
                  </div>
                </div>
                <div className="text-lg font-semibold text-white mt-3">
                  {playerChoice.name}
                </div>
              </div>

              <div className="text-6xl animate-pulse">⚔️</div>

              <div className="text-center">
                <div className="text-sm text-white/60 mb-2">AI</div>
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                  <div
                    className="text-8xl animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  >
                    {computerChoice.emoji}
                  </div>
                </div>
                <div className="text-lg font-semibold text-white mt-3">
                  {computerChoice.name}
                </div>
              </div>
            </div>
          </div>
        ) : gamePhase === "choosing" ? (
          // Show choice buttons
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
                  disabled={isRevealing}
                  isSelected={playerChoice?.id === choice.id}
                  size="large"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Back Button */}
      <div
        className={`text-center transform transition-all duration-1000 delay-800 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <button
          onClick={newGame}
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
      <div className="fixed top-1/4 left-10 w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-60"></div>
      <div className="fixed top-1/3 right-10 w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse opacity-60"></div>
      <div className="fixed bottom-1/4 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-bounce opacity-60"></div>
      <div className="fixed bottom-1/3 right-1/4 w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-60"></div>
    </div>
  );
};

export default AIGame;

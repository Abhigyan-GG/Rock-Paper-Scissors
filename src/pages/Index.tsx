import React, { useState, useEffect } from "react";
import ModeSelector from "../components/ui/ModeSelector";
import GameScreen from "../components/ui/GameScreen";
import GameResult from "../components/ui/GameResult";
import MultiplayerGame from "../components/ui/MultiplayerGame";
import Layout from "../components/ui/Layout";
import { soundManager } from "../utils/soundManager";
import {
  GameMode,
  Screen,
  Choice,
  ChoiceId,
  GameResult as GameResultType,
  GameScore,
} from "../types";
import {
  choices,
  getComputerChoice,
  determineWinner,
} from "../utils/gameLogic";

const Index = () => {
  // Game state
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("modeSelect");
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [player2Choice, setPlayer2Choice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [result, setResult] = useState<GameResultType>(null);
  const [score, setScore] = useState<GameScore>({
    player1: 0,
    player2: 0,
    computer: 0,
  });
  const [isRevealing, setIsRevealing] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Enhanced entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      soundManager.playGameStart();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced mode selection with animations
  const handleModeSelect = async (mode: GameMode) => {
    await soundManager.playButtonClick();

    // Add exit animation
    setIsLoaded(false);

    setTimeout(() => {
      setGameMode(mode);
      setCurrentScreen(mode === "multiplayer" ? "multiplayer" : "game");
      setIsLoaded(true);
    }, 300);
  };

  // Enhanced choice handling with animations and sound
  const handleChoice = async (choice: Choice) => {
    try {
      await soundManager.playChoice();
    } catch (error) {
      console.warn("Sound playback failed:", error);
    }

    if (gameMode === "computer") {
      setPlayerChoice(choice);
      setIsRevealing(true);

      // Dramatic pause before revealing computer choice
      setTimeout(() => {
        const compChoice = getComputerChoice();
        setComputerChoice(compChoice);

        // Another pause before showing result
        setTimeout(() => {
          const winner = determineWinner(choice, compChoice);
          setResult(winner);

          // Update score with animation
          if (winner === "player1") {
            setScore((prev) => ({ ...prev, player1: prev.player1 + 1 }));
            soundManager.playWin();
          } else if (winner === "player2") {
            setScore((prev) => ({ ...prev, computer: prev.computer + 1 }));
            soundManager.playLose();
          } else {
            soundManager.playTie();
          }

          setCurrentScreen("result");
          setIsRevealing(false);
        }, 800);
      }, 1000);
    } else {
      // Two player mode
      if (currentPlayer === 1) {
        setPlayerChoice(choice);
        setCurrentPlayer(2);
        await soundManager.playTone(600, 0.1, "sine", 0.05); // Different tone for player 2
      } else {
        setPlayer2Choice(choice);
        setIsRevealing(true);

        setTimeout(() => {
          const winner = determineWinner(playerChoice!, choice);
          setResult(winner);

          if (winner === "player1") {
            setScore((prev) => ({ ...prev, player1: prev.player1 + 1 }));
            soundManager.playWin();
          } else if (winner === "player2") {
            setScore((prev) => ({ ...prev, player2: prev.player2 + 1 }));
            soundManager.playWin(); // Both players can win
          } else {
            soundManager.playTie();
          }

          setCurrentScreen("result");
          setIsRevealing(false);
        }, 1500);
      }
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Enhanced reset with animations
  const resetGame = async () => {
    await soundManager.playButtonClick();

    setIsLoaded(false);

    setTimeout(() => {
      setPlayerChoice(null);
      setPlayer2Choice(null);
      setComputerChoice(null);
      setCurrentPlayer(1);
      setResult(null);
      setCurrentScreen("game");
      setRoundNumber((prev) => prev + 1);
      setIsLoaded(true);
    }, 200);
  };

  // Enhanced reset all with animations
  const resetAll = async () => {
    await soundManager.playButtonClick();

    setIsLoaded(false);

    setTimeout(() => {
      setGameMode(null);
      setCurrentScreen("modeSelect");
      setPlayerChoice(null);
      setPlayer2Choice(null);
      setComputerChoice(null);
      setCurrentPlayer(1);
      setResult(null);
      setScore({ player1: 0, player2: 0, computer: 0 });
      setRoundNumber(1);
      setIsLoaded(true);
    }, 300);
  };

  // Render appropriate screen content
  const renderContent = () => {
    const baseClasses = `transition-all duration-700 ${
      isLoaded
        ? "opacity-100 transform translate-y-0"
        : "opacity-0 transform translate-y-10"
    }`;

    switch (currentScreen) {
      case "modeSelect":
        return (
          <div className={baseClasses}>
            <ModeSelector onModeSelect={handleModeSelect} />
          </div>
        );

      case "multiplayer":
        return (
          <div className={baseClasses}>
            <MultiplayerGame />
          </div>
        );

      case "game":
        return (
          <div className={baseClasses}>
            <GameScreen
              gameMode={gameMode}
              currentPlayer={currentPlayer}
              score={score}
              roundNumber={roundNumber}
              isRevealing={isRevealing}
              onChoice={handleChoice}
              onBackToModeSelection={resetAll}
            />
          </div>
        );

      case "result":
        return (
          <div className={baseClasses}>
            <GameResult
              gameMode={gameMode}
              result={result}
              playerChoice={playerChoice}
              player2Choice={player2Choice}
              computerChoice={computerChoice}
              score={score}
              onPlayAgain={resetGame}
              onNewGame={resetAll}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      {/* Screen transition container */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Main content with enhanced transitions */}
        <div className="w-full">{renderContent()}</div>

        {/* Floating decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-purple-400/30 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-cyan-400/40 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-pink-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-48 right-1/4 w-2 h-2 bg-yellow-400/40 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-green-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-2/3 right-1/3 w-2.5 h-2.5 bg-blue-400/30 rounded-full animate-bounce"></div>

          {/* Larger floating elements */}
          <div className="absolute top-1/4 right-10 w-8 h-8 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full animate-float"></div>
          <div
            className="absolute bottom-1/4 left-10 w-6 h-6 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-4 h-4 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Screen overlay effects */}
        {currentScreen === "result" && result && (
          <div className="fixed inset-0 pointer-events-none">
            {/* Celebration particles for wins */}
            {result !== "tie" && (
              <>
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 animate-ping"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      top: `${10 + Math.random() * 80}%`,
                      backgroundColor: [
                        "#F59E0B",
                        "#EF4444",
                        "#8B5CF6",
                        "#06B6D4",
                        "#10B981",
                      ][i % 5],
                      animationDelay: `${i * 200}ms`,
                      animationDuration: "3s",
                    }}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* Loading state for screen transitions */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="spinner"></div>
              <div className="text-white/80 text-lg">Loading...</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;

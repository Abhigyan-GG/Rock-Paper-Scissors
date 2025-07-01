import React, { useState, useEffect, useRef, useCallback } from "react";
import { socketService } from "../../utils/socketService";
import { soundManager } from "../../utils/soundManager";
import type {
  GameRoom,
  MultiplayerPlayer as Player,
  RoundResult,
} from "../../types";

// Enhanced types for better UX
interface GameHistoryItem {
  round: number;
  playerChoice: string;
  opponentChoice: string;
  result: "player1" | "player2" | "tie";
  timestamp: string;
}

interface ParticleEffect {
  id: number;
  x: number;
  y: number;
  color: string;
  duration: number;
}

export const useMultiplayerGame = () => {
  // Game State
  const [gameState, setGameState] = useState<
    "menu" | "waiting" | "playing" | "finished" | "connecting"
  >("menu");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playerStats, setPlayerStats] = useState({
    wins: 0,
    losses: 0,
    ties: 0,
  });
  const [reconnecting, setReconnecting] = useState(false);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);

  const timerStateRef = useRef({
    isActive: false,
    startTime: 0,
    choiceMade: false,
    intervalId: null as NodeJS.Timeout | null,
    roundId: 0,
  });

  const ROUND_DURATION = 10000;
  const RESULT_DISPLAY_DELAY = 3000;

  // Enhanced particle system
  const addParticles = useCallback(
    (x: number, y: number, color: string = "#8B5CF6") => {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 100,
        color,
        duration: 1000 + Math.random() * 500,
      }));

      setParticles((prev) => [...prev, ...newParticles]);

      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.some((np) => np.id === p.id)),
        );
      }, 1500);
    },
    [],
  );

  const stopTimer = useCallback(() => {
    console.log("🛑 STOPPING TIMER");
    timerStateRef.current.isActive = false;

    if (timerStateRef.current.intervalId) {
      clearInterval(timerStateRef.current.intervalId);
      timerStateRef.current.intervalId = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();

    const roundId = Date.now();
    console.log("▶️ STARTING TIMER for round:", roundId);

    timerStateRef.current = {
      isActive: true,
      startTime: Date.now(),
      choiceMade: false,
      intervalId: null,
      roundId,
    };

    setTimeLeft(10);

    const updateTimer = () => {
      const state = timerStateRef.current;

      if (!state.isActive || state.choiceMade || state.roundId !== roundId) {
        if (state.intervalId) {
          clearInterval(state.intervalId);
          state.intervalId = null;
        }
        return;
      }

      const elapsed = Date.now() - state.startTime;
      const remaining = Math.max(
        0,
        Math.ceil((ROUND_DURATION - elapsed) / 1000),
      );

      setTimeLeft(remaining);

      // Sound countdown for last 3 seconds
      if (remaining <= 3 && remaining > 0 && soundEnabled) {
        soundManager.playCountdown();
      }

      // Auto-submit when time runs out
      if (
        remaining <= 0 &&
        state.isActive &&
        !state.choiceMade &&
        state.roundId === roundId &&
        currentRoom &&
        gameState === "playing" &&
        !playerChoice
      ) {
        console.log("⏰ AUTO-SUBMITTING");

        state.choiceMade = true;
        state.isActive = false;

        const randomChoice = ["rock", "paper", "scissors"][
          Math.floor(Math.random() * 3)
        ];
        setPlayerChoice(randomChoice);
        socketService.makeChoice({
          roomCode: currentRoom.id,
          choice: randomChoice,
        });
        setMessage("⏰ Time up! Random choice submitted...");

        if (state.intervalId) {
          clearInterval(state.intervalId);
          state.intervalId = null;
        }
      }
    };

    const intervalId = setInterval(updateTimer, 100);
    timerStateRef.current.intervalId = intervalId;
    updateTimer();
  }, [stopTimer, currentRoom, gameState, playerChoice, soundEnabled]);

  const startNewRound = useCallback(() => {
    console.log("🎯 Starting new round");

    stopTimer();

    setPlayerChoice(null);
    setOpponentChoice(null);
    setRoundResult(null);
    setMessage("🎯 Make your choice! You have 10 seconds...");

    timerStateRef.current.choiceMade = false;

    setTimeout(() => {
      startTimer();
    }, 100);
  }, [startTimer, stopTimer]);

  const makeChoice = useCallback(
    (choice: string, event?: React.MouseEvent) => {
      console.log("🎯 Making choice:", choice);

      if (
        !currentRoom ||
        gameState !== "playing" ||
        playerChoice ||
        roundResult
      ) {
        return;
      }

      if (timerStateRef.current.choiceMade || timeLeft <= 0) {
        return;
      }

      timerStateRef.current.choiceMade = true;
      timerStateRef.current.isActive = false;

      stopTimer();

      setPlayerChoice(choice);
      socketService.makeChoice({ roomCode: currentRoom.id, choice });
      setMessage(`✅ Choice submitted: ${choice}! Waiting for opponent...`);

      // Enhanced feedback
      if (soundEnabled) {
        soundManager.playChoice();
      }

      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }

      // Add particles at click location
      if (event) {
        const rect = event.currentTarget.getBoundingClientRect();
        addParticles(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          "#10B981",
        );
      }
    },
    [
      currentRoom,
      gameState,
      playerChoice,
      roundResult,
      timeLeft,
      stopTimer,
      soundEnabled,
      addParticles,
    ],
  );

  const setupSocketListeners = useCallback(() => {
    console.log("🔧 Setting up socket listeners");

    socketService.removeAllListeners();

    socketService.onRoomCreated(({ roomCode, player }) => {
      console.log("📦 Room created:", roomCode);
      setRoomCode(roomCode);
      setCurrentPlayer(player);
      setGameState("waiting");
      setMessage(`🎉 Room created! Share code: ${roomCode}`);

      if (soundEnabled) {
        soundManager.playConnection();
      }
    });

    socketService.onRoomUpdated((updatedRoom) => {
      setCurrentRoom(updatedRoom);
    });

    socketService.onPlayerJoined(({ room, newPlayer }) => {
      console.log("👥 Player joined:", newPlayer.name);
      setCurrentRoom(room);
      const socketId = socketService.socketInstance?.id;
      if (!socketId) return;

      const joinedPlayer = room.players.find((p) => p.id === socketId);
      const otherPlayer = room.players.find((p) => p.id !== socketId);

      if (joinedPlayer) setCurrentPlayer(joinedPlayer);
      if (otherPlayer) setOpponent(otherPlayer);

      setGameState("playing");
      setMessage(`🎮 ${newPlayer.name} joined! Game starting...`);

      if (soundEnabled) {
        soundManager.playGameStart();
      }

      setTimeout(() => {
        startNewRound();
      }, 2000);
    });

    socketService.onRoundStarted(() => {
      console.log("▶️ Round started from server");
      startNewRound();
    });

    socketService.onPlayerMadeChoice(({ playerName }) => {
      console.log("✅ Player made choice:", playerName);
      const socketId = socketService.socketInstance?.id;
      if (socketId && currentPlayer && opponent) {
        if (playerName === opponent.name) {
          setOpponentChoice("made");
          setMessage(
            `⚡ ${playerName} made their choice! Waiting for results...`,
          );
        }
      }
    });

    socketService.onRoundResult((result) => {
      console.log("🎲 Round result received:", result);

      stopTimer();

      setRoundResult(result);
      setTimeLeft(0);

      const socketId = socketService.socketInstance?.id;
      const updatedCurrentPlayer = result.players.find(
        (p) => p.id === socketId,
      );
      const updatedOpponent = result.players.find((p) => p.id !== socketId);

      if (updatedCurrentPlayer) setCurrentPlayer(updatedCurrentPlayer);
      if (updatedOpponent) setOpponent(updatedOpponent);

      const playerChoiceResult = result.playerChoices[socketId || ""] || "";
      const opponentChoiceResult = Object.keys(result.playerChoices).find(
        (id) => id !== socketId,
      );
      const opponentChoiceStr = opponentChoiceResult
        ? result.playerChoices[opponentChoiceResult]
        : "";

      setPlayerChoice(playerChoiceResult);
      setOpponentChoice(opponentChoiceStr);

      const roundData: GameHistoryItem = {
        round: result.round,
        playerChoice: playerChoiceResult,
        opponentChoice: opponentChoiceStr,
        result: result.result,
        timestamp: new Date().toLocaleTimeString(),
      };
      setGameHistory((prev) => [...prev, roundData]);

      // Enhanced sound feedback
      if (soundEnabled) {
        if (result.result === "tie") {
          setPlayerStats((prev) => ({ ...prev, ties: prev.ties + 1 }));
          soundManager.playTie();
        } else {
          const winner =
            result.result === "player1" ? result.players[0] : result.players[1];
          const isCurrentPlayerWinner = winner.id === socketId;
          if (isCurrentPlayerWinner) {
            setPlayerStats((prev) => ({ ...prev, wins: prev.wins + 1 }));
            soundManager.playWin();
          } else {
            setPlayerStats((prev) => ({ ...prev, losses: prev.losses + 1 }));
            soundManager.playLose();
          }
        }
      }

      let resultMessage = "";
      if (result.result === "tie") {
        resultMessage = "🤝 It's a tie! Great minds think alike!";
      } else {
        const winner =
          result.result === "player1" ? result.players[0] : result.players[1];
        const isCurrentPlayerWinner = winner.id === socketId;
        resultMessage = isCurrentPlayerWinner
          ? `🎉 You win this round! Well played!`
          : `😅 ${winner.name} wins this round! Better luck next time!`;
      }
      setMessage(resultMessage);

      setTimeout(() => {
        if (currentRoom && result.round < currentRoom.maxRounds) {
          startNewRound();
        }
      }, RESULT_DISPLAY_DELAY);
    });

    socketService.onGameFinished(({ winner }) => {
      console.log("🏁 Game finished");
      stopTimer();

      setGameState("finished");
      const socketId = socketService.socketInstance?.id;

      if (winner) {
        const isCurrentPlayerWinner = winner.id === socketId;
        setMessage(
          isCurrentPlayerWinner
            ? `���� Congratulations! You won the game!`
            : `🎯 ${winner.name} wins the game! Good game!`,
        );

        if (soundEnabled) {
          if (isCurrentPlayerWinner) {
            soundManager.playWin();
          } else {
            soundManager.playLose();
          }
        }
      } else {
        setMessage("🤝 It's a tie game! Excellent match!");
        if (soundEnabled) {
          soundManager.playTie();
        }
      }
    });

    socketService.onPlayerDisconnected(({ playerName }) => {
      console.log("👤 Player disconnected:", playerName);
      stopTimer();

      setMessage(`📱 ${playerName} disconnected. Waiting for reconnection...`);
      setGameState("waiting");
      setOpponent(null);

      if (soundEnabled) {
        soundManager.playDisconnection();
      }
    });

    socketService.onError((error) => {
      console.error("❌ Socket error:", error);
      setMessage(`❌ Error: ${error}`);
      setConnectionError(error);
    });
  }, [
    startNewRound,
    stopTimer,
    currentPlayer,
    opponent,
    currentRoom,
    soundEnabled,
    addParticles,
  ]);

  // Connection management
  useEffect(() => {
    const connectSocket = async () => {
      try {
        setIsLoading(true);
        setReconnecting(false);
        setGameState("connecting");

        await socketService.connect();
        setIsConnected(true);
        setConnectionError("");
        setGameState("menu");

        console.log("🔌 Socket connected successfully");

        if (soundEnabled) {
          soundManager.playConnection();
        }
      } catch (error) {
        console.error("❌ Connection failed:", error);
        setConnectionError(
          "Failed to connect to server. Attempting to reconnect...",
        );
        setReconnecting(true);
        setGameState("menu");

        setTimeout(() => {
          if (!isConnected) connectSocket();
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isConnected) {
      connectSocket();
    }

    return () => {
      stopTimer();
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [stopTimer, soundEnabled]);

  // Setup listeners when connected
  useEffect(() => {
    if (isConnected) {
      setupSocketListeners();
    }
  }, [isConnected, setupSocketListeners]);

  // Game actions
  const createRoom = useCallback(() => {
    if (playerName.trim()) {
      setIsLoading(true);
      socketService.createRoom(playerName.trim());
      setTimeout(() => setIsLoading(false), 1000);

      if (soundEnabled) {
        soundManager.playButtonClick();
      }
    }
  }, [playerName, soundEnabled]);

  const joinRoom = useCallback(() => {
    const trimmedCode = roomCode.trim().toUpperCase();
    const trimmedName = playerName.trim();
    if (trimmedName && trimmedCode) {
      setIsLoading(true);
      socketService.joinRoom(trimmedCode, trimmedName);
      setTimeout(() => setIsLoading(false), 1000);

      if (soundEnabled) {
        soundManager.playButtonClick();
      }
    }
  }, [roomCode, playerName, soundEnabled]);

  const startNewGame = useCallback(() => {
    if (currentRoom) {
      console.log("🎮 Starting new game");
      stopTimer();

      socketService.startNewGame(currentRoom.id);
      setGameState("playing");
      setMessage("🎮 New game started!");
      setRoundResult(null);
      setGameHistory([]);
      setPlayerChoice(null);
      setOpponentChoice(null);

      timerStateRef.current.choiceMade = false;

      if (soundEnabled) {
        soundManager.playGameStart();
      }

      setTimeout(() => {
        startNewRound();
      }, 1000);
    }
  }, [currentRoom, startNewRound, stopTimer, soundEnabled]);

  const resetToMenu = useCallback(() => {
    console.log("🏠 Resetting to menu");
    stopTimer();

    setGameState("menu");
    setCurrentRoom(null);
    setCurrentPlayer(null);
    setOpponent(null);
    setRoundResult(null);
    setRoomCode("");
    setMessage("");
    setPlayerChoice(null);
    setOpponentChoice(null);
    setTimeLeft(0);
    setConnectionError("");
    setGameHistory([]);

    timerStateRef.current.choiceMade = false;
  }, [stopTimer]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setMessage("📋 Room code copied to clipboard!");
    setTimeout(
      () => setMessage(`🎉 Room created! Share code: ${roomCode}`),
      2000,
    );

    if (soundEnabled) {
      soundManager.playButtonClick();
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    if (soundEnabled) {
      soundManager.playButtonClick();
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    soundManager.setEnabled(!soundEnabled);
    if (!soundEnabled) {
      soundManager.playButtonClick();
    }
  };

  // Utility functions
  const getChoiceEmoji = (choice: string) => {
    const emojiMap: Record<string, string> = {
      rock: "🪨",
      paper: "📄",
      scissors: "✂️",
    };
    return emojiMap[choice] || "❓";
  };

  const getTimerColor = () => {
    if (timeLeft > 7) return "text-green-400";
    if (timeLeft > 3) return "text-yellow-400";
    return "text-red-400 animate-pulse";
  };

  return {
    // State
    gameState,
    playerName,
    setPlayerName,
    roomCode,
    setRoomCode,
    currentRoom,
    currentPlayer,
    opponent,
    roundResult,
    message,
    isConnected,
    playerChoice,
    opponentChoice,
    isLoading,
    connectionError,
    timeLeft,
    gameHistory,
    soundEnabled,
    showSettings,
    setShowSettings,
    playerStats,
    reconnecting,
    particles,

    // Actions
    createRoom,
    joinRoom,
    makeChoice,
    startNewGame,
    resetToMenu,
    copyRoomCode,
    toggleSettings,
    toggleSound,

    // Utilities
    getChoiceEmoji,
    getTimerColor,
  };
};

// Enhanced UI Components

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
    <div className="text-center">
      <div className="relative mb-8">
        <div className="spinner mx-auto"></div>
        <div className="absolute inset-0 animate-ping">
          <div className="w-10 h-10 bg-purple-400/30 rounded-full mx-auto"></div>
        </div>
      </div>
      <div className="text-white text-2xl font-semibold animate-pulse">
        Connecting to the battlefield...
      </div>
      <div className="text-white/60 text-lg mt-2">Preparing your weapons</div>
    </div>
  </div>
);

const ConnectionError = ({
  connectionError,
  reconnecting,
}: {
  connectionError: string;
  reconnecting: boolean;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
    <div className="glass rounded-3xl shadow-2xl p-12 max-w-md mx-auto text-center">
      <div className="text-8xl mb-6 animate-bounce">
        {reconnecting ? "🔄" : "⚠️"}
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">
        {reconnecting ? "Reconnecting..." : "Connection Lost"}
      </h2>
      <p className="text-white/80 mb-8 text-lg">
        {connectionError || "Unable to connect to game server"}
      </p>
      {reconnecting && <div className="spinner mx-auto mb-6"></div>}
      <button
        onClick={() => window.location.reload()}
        disabled={reconnecting}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
      >
        {reconnecting ? "Reconnecting..." : "Retry Connection"}
      </button>
    </div>
  </div>
);

const MultiplayerGame = () => {
  const gameProps = useMultiplayerGame();

  const {
    gameState,
    connectionError,
    reconnecting,
    playerName,
    setPlayerName,
    roomCode,
    setRoomCode,
    createRoom,
    joinRoom,
    message,
    copyRoomCode,
    resetToMenu,
    currentPlayer,
    opponent,
    currentRoom,
    timeLeft,
    getTimerColor,
    roundResult,
    getChoiceEmoji,
    makeChoice,
    playerChoice,
    opponentChoice,
    gameHistory,
    showSettings,
    setShowSettings,
    startNewGame,
    soundEnabled,
    toggleSound,
    toggleSettings,
    playerStats,
    particles,
    isLoading,
  } = gameProps;

  // Enhanced Menu Screen
  const MenuScreen = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="glass rounded-3xl shadow-2xl p-8 animate-slide-in-up">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4 animate-text-shimmer">
            🚀 Ready to Battle?
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-white/90 mb-3">
              Your Epic Name
            </label>
            <input
              type="text"
              placeholder="Enter your warrior name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-4 glass rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors duration-300 text-lg"
              maxLength={20}
            />
          </div>

          <button
            onClick={createRoom}
            disabled={!playerName.trim() || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:scale-100 text-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="spinner mr-3"></div>
                Creating Room...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="text-2xl mr-2">🎮</span>
                Create New Room
              </span>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 glass text-white/70 rounded-full py-1">
                or join existing
              </span>
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-white/90 mb-3">
              Room Code
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full p-4 glass rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-center tracking-widest transition-colors duration-300 text-lg"
              maxLength={6}
            />
          </div>

          <button
            onClick={joinRoom}
            disabled={!playerName.trim() || !roomCode.trim() || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:scale-100 text-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="spinner mr-3"></div>
                Joining Room...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="text-2xl mr-2">🎯</span>
                Join Room
              </span>
            )}
          </button>
        </div>

        {message && (
          <div className="mt-6 p-4 glass rounded-2xl border border-red-400/30">
            <div className="text-red-300 text-center font-medium">
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Enhanced Waiting Screen
  const WaitingScreen = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="glass rounded-3xl shadow-2xl p-8 text-center animate-slide-in-down">
        <div className="mb-8">
          <div className="text-8xl mb-6 animate-bounce">⏳</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Waiting for Opponent
          </h2>
          <p className="text-white/70 text-lg">
            Seeking a worthy challenger...
          </p>
        </div>

        <div className="glass rounded-2xl p-6 mb-8">
          <div className="text-sm text-white/60 mb-2">Share this Room Code</div>
          <div className="flex items-center justify-center space-x-3">
            <span className="font-mono font-bold text-3xl text-purple-300 tracking-widest">
              {roomCode}
            </span>
            <button
              onClick={copyRoomCode}
              className="p-3 glass rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
        </div>

        <div className="flex justify-center space-x-2 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>

        <button
          onClick={resetToMenu}
          className="w-full glass hover:bg-white/20 text-white px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );

  // Playing Screen
  const PlayingScreen = () => (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Score Display */}
      <div className="flex justify-center">
        <div className="glass rounded-3xl p-6 flex items-center space-x-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-300">
              {currentPlayer?.name}
            </div>
            <div className="text-4xl font-bold text-white">
              {currentPlayer?.score}
            </div>
            <div className="text-sm text-white/60">You</div>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-2">⚔️</div>
            <div className="text-sm text-white/80 font-medium">
              Round {currentRoom?.round || 1} of {currentRoom?.maxRounds || 5}
            </div>
            {timeLeft > 0 && (
              <div className={`text-2xl font-bold ${getTimerColor()} mt-2`}>
                {timeLeft}s
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-300">
              {opponent?.name}
            </div>
            <div className="text-4xl font-bold text-white">
              {opponent?.score}
            </div>
            <div className="text-sm text-white/60">Opponent</div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="glass rounded-3xl p-8">
        {roundResult ? (
          // Round Result Display
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-8 text-white">
              🎲 Round Result
            </h3>
            <div className="flex justify-center items-center space-x-12 mb-8">
              <div className="text-center">
                <div className="text-sm text-white/60 mb-2">
                  {currentPlayer?.name}
                </div>
                <div className="text-8xl animate-bounce">
                  {getChoiceEmoji(playerChoice || "")}
                </div>
              </div>
              <div className="text-6xl animate-pulse">⚡</div>
              <div className="text-center">
                <div className="text-sm text-white/60 mb-2">
                  {opponent?.name}
                </div>
                <div
                  className="text-8xl animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                >
                  {getChoiceEmoji(opponentChoice || "")}
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gradient-rainbow">
              {message}
            </div>
          </div>
        ) : (
          // Choice Selection
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-8 text-white">
              {timeLeft > 0
                ? `⏰ ${timeLeft}s remaining`
                : "🎯 Make Your Choice"}
            </h3>

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-8">
              {["rock", "paper", "scissors"].map((choice) => (
                <button
                  key={choice}
                  onClick={(e) => makeChoice(choice, e)}
                  disabled={!!playerChoice || !!roundResult || timeLeft <= 0}
                  className={`
                    p-8 rounded-3xl border-2 text-6xl transition-all duration-300 transform
                    ${
                      playerChoice === choice
                        ? "border-purple-400 bg-gradient-to-br from-purple-100/20 to-purple-200/20 scale-110 shadow-2xl"
                        : playerChoice || roundResult || timeLeft <= 0
                          ? "border-white/20 bg-white/5 opacity-50 cursor-not-allowed"
                          : "border-white/30 glass hover:border-purple-400 hover:scale-105 hover:shadow-xl cursor-pointer"
                    }
                  `}
                >
                  {getChoiceEmoji(choice)}
                  <div className="text-lg mt-3 capitalize font-medium text-white">
                    {choice}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="text-xl text-white/90">{message}</div>
              {playerChoice && !roundResult && (
                <div className="text-green-400 font-semibold flex items-center justify-center space-x-2">
                  <span>✅</span>
                  <span>Your choice: {playerChoice}</span>
                </div>
              )}
              {opponentChoice === "made" && !roundResult && (
                <div className="text-blue-400 font-semibold flex items-center justify-center space-x-2">
                  <span>⚡</span>
                  <span>Opponent ready!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="text-center space-x-4">
        <button
          onClick={resetToMenu}
          className="glass hover:bg-white/20 text-white px-8 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105"
        >
          🚪 Leave Game
        </button>

        <button
          onClick={toggleSettings}
          className="glass hover:bg-white/20 text-white px-8 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105"
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  );

  // Finished Screen
  const FinishedScreen = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass rounded-3xl shadow-2xl p-12 text-center animate-bounce-in">
        <div className="text-8xl mb-8 animate-bounce">🏆</div>
        <h2 className="text-4xl font-bold text-white mb-6">Game Complete!</h2>

        {currentPlayer && opponent && (
          <div className="mb-8">
            <div className="text-xl mb-6 text-white/80">
              Final Battle Results
            </div>
            <div className="glass rounded-2xl p-8">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="font-bold text-2xl text-purple-300">
                    {currentPlayer.name}
                  </div>
                  <div className="text-5xl font-bold text-white">
                    {currentPlayer.score}
                  </div>
                </div>
                <div className="text-4xl">🆚</div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-blue-300">
                    {opponent.name}
                  </div>
                  <div className="text-5xl font-bold text-white">
                    {opponent.score}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-2xl font-bold mb-8 text-gradient-rainbow">
          {message}
        </div>

        <div className="space-y-4">
          <button
            onClick={startNewGame}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 text-lg"
          >
            🔄 Play Again
          </button>
          <button
            onClick={resetToMenu}
            className="w-full glass hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 text-lg"
          >
            🏠 Back to Menu
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Particle Effects */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed w-2 h-2 rounded-full pointer-events-none animate-ping z-50"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}ms`,
          }}
        />
      ))}

      {/* Game State Rendering */}
      {gameState === "connecting" && <LoadingScreen />}

      {connectionError && !reconnecting && (
        <ConnectionError
          connectionError={connectionError}
          reconnecting={reconnecting}
        />
      )}

      {gameState === "menu" && <MenuScreen />}
      {gameState === "waiting" && <WaitingScreen />}
      {gameState === "playing" && <PlayingScreen />}
      {gameState === "finished" && <FinishedScreen />}
    </div>
  );
};

export default MultiplayerGame;

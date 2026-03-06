"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Chess, Square, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { RotateCcw, Trophy } from "lucide-react";
import Image from "next/image";
import coachesData from "@/data/coaches.json";

// ─── Coach type ──────────────────────────────────────────────────────────────
interface Coach {
  id: string;
  name: string;
  elo: number;
  title: string;
  avatar: string;
}

// ─── Stockfish Web Worker Hook ───────────────────────────────────────────────
function useStockfish() {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    type: "cp" | "mate";
    value: number;
    turn: "w" | "b";
  } | null>(null);

  // We need a ref to track the current turn we asked Stockfish to evaluate
  // so we can normalize the score correctly (Stockfish gives score from perspective of player to move).
  const currentEvalTurnRef = useRef<"w" | "b">("w");

  useEffect(() => {
    const worker = new Worker("/stockfish/stockfish.js");
    workerRef.current = worker;

    const handleMessage = (e: MessageEvent) => {
      const msg = typeof e.data === "string" ? e.data : "";
      if (msg === "readyok") {
        setIsReady(true);
      }
    };

    worker.addEventListener("message", handleMessage);

    // Initialize UCI
    worker.postMessage("uci");
    // Set max skill level for strongest play
    worker.postMessage("setoption name Skill Level value 20");
    worker.postMessage("isready");

    return () => {
      worker.postMessage("quit");
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const getBestMove = useCallback(
    (fen: string): Promise<string | null> => {
      return new Promise((resolve) => {
        if (!workerRef.current || !isReady) {
          resolve(null);
          return;
        }

        const worker = workerRef.current;

        const handleResponse = (e: MessageEvent) => {
          const msg = typeof e.data === "string" ? e.data : "";

          // Parse evaluation info
          if (msg.startsWith("info depth") && msg.includes("score")) {
            const cpMatch = msg.match(/score cp (-?\d+)/);
            const mateMatch = msg.match(/score mate (-?\d+)/);

            if (mateMatch) {
              setEvaluation({
                type: "mate",
                value: parseInt(mateMatch[1], 10),
                turn: currentEvalTurnRef.current,
              });
            } else if (cpMatch) {
              setEvaluation({
                type: "cp",
                value: parseInt(cpMatch[1], 10),
                turn: currentEvalTurnRef.current,
              });
            }
          }

          if (msg.startsWith("bestmove")) {
            worker.removeEventListener("message", handleResponse);
            const bestMove = msg.split(" ")[1];
            resolve(bestMove || null);
          }
        };

        currentEvalTurnRef.current = fen.split(" ")[1] === "w" ? "w" : "b";
        worker.addEventListener("message", handleResponse);
        worker.postMessage("position fen " + fen);
        // Use fixed time limit for consistent speed on mobile devices
        worker.postMessage("go movetime 1000");
      });
    },
    [isReady],
  );

  const evaluatePosition = useCallback(
    (fen: string) => {
      if (!workerRef.current || !isReady) return;
      currentEvalTurnRef.current = fen.split(" ")[1] === "w" ? "w" : "b";
      // Clear previous specific event listeners if any (hard to do cleanly without tracking them,
      // but for simple evaluation we just send position and wait for 'info' which is captured by the global listener or next bestmove)
      // We will actually just run a shorter depth search to get the evaluation fast without blocking a full move search.
      workerRef.current.postMessage("position fen " + fen);
      workerRef.current.postMessage("go movetime 250");
    },
    [isReady],
  );

  return { isReady, getBestMove, evaluatePosition, evaluation };
}

// ─── Custom Board Styles ─────────────────────────────────────────────────────
const customDarkSquareStyle: React.CSSProperties = {
  backgroundColor: "#ef4444",
};

const customLightSquareStyle: React.CSSProperties = {
  backgroundColor: "#fee2e2",
};

// ─── Main ChessGame Component ────────────────────────────────────────────────
type GameStatus =
  | "playing"
  | "check"
  | "checkmate-win"
  | "checkmate-lose"
  | "stalemate"
  | "draw"
  | "thinking";

export default function ChessGame() {
  // ─── Random coach selection (once on mount) ────────────────────────────
  // ─── Random coach selection (once on mount) ────────────────────────────
  const [coach, setCoach] = useState<Coach>(coachesData[0] as Coach);

  useEffect(() => {
    setCoach(
      coachesData[Math.floor(Math.random() * coachesData.length)] as Coach,
    );
  }, []);

  const gameRef = useRef(new Chess());
  const [gameFen, setGameFen] = useState(gameRef.current.fen());
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<
    Record<string, React.CSSProperties>
  >({});
  const [lastMoveSquares, setLastMoveSquares] = useState<
    Record<string, React.CSSProperties>
  >({});
  const [rightClickedSquares, setRightClickedSquares] = useState<
    Record<string, React.CSSProperties>
  >({});
  const { isReady, getBestMove, evaluatePosition, evaluation } = useStockfish();
  const [showEvalBar, setShowEvalBar] = useState(true);
  const isThinkingRef = useRef(false);

  const game = gameRef.current;

  // ─── Update game status ──────────────────────────────────────────────────
  const updateStatus = useCallback(() => {
    if (game.isCheckmate()) {
      setGameStatus(game.turn() === "w" ? "checkmate-lose" : "checkmate-win");
    } else if (game.isStalemate()) {
      setGameStatus("stalemate");
    } else if (game.isDraw()) {
      setGameStatus("draw");
    } else if (game.isCheck()) {
      setGameStatus("check");
    } else {
      setGameStatus("playing");
    }
  }, [game]);

  // ─── Highlight last move ─────────────────────────────────────────────────
  const highlightLastMove = useCallback((from: string, to: string) => {
    setLastMoveSquares({
      [from]: { backgroundColor: "rgba(220, 38, 38, 0.2)" },
      [to]: { backgroundColor: "rgba(220, 38, 38, 0.3)" },
    });
  }, []);

  // ─── Bot makes a move ────────────────────────────────────────────────────
  const makeBotMove = useCallback(async () => {
    if (game.isGameOver() || game.turn() !== "b" || isThinkingRef.current)
      return;

    isThinkingRef.current = true;
    setGameStatus("thinking");

    // Small delay to make it feel natural
    await new Promise((r) => setTimeout(r, 300));

    const bestMove = await getBestMove(game.fen());

    if (bestMove && !game.isGameOver()) {
      const from = bestMove.substring(0, 2) as Square;
      const to = bestMove.substring(2, 4) as Square;
      const promotion = bestMove.length > 4 ? bestMove[4] : undefined;

      try {
        const move = game.move({
          from,
          to,
          promotion: promotion as "q" | "r" | "b" | "n" | undefined,
        });

        if (move) {
          setGameFen(game.fen());
          highlightLastMove(from, to);
          updateStatus();
        }
      } catch {
        updateStatus();
      }
    }

    isThinkingRef.current = false;
  }, [game, getBestMove, highlightLastMove, updateStatus]);

  // ─── Trigger bot move when it's black's turn ─────────────────────────────
  useEffect(() => {
    if (!isReady || game.isGameOver()) return;

    if (game.turn() === "b") {
      makeBotMove();
    } else {
      // It's white's turn, get a quick evaluation for the bar
      evaluatePosition(gameFen);
    }
  }, [gameFen, isReady, game, makeBotMove, evaluatePosition]);

  // ─── Get valid moves for a square (for click-to-move) ────────────────────
  const getMoveOptions = useCallback(
    (square: Square) => {
      const moves = game.moves({ square, verbose: true });
      if (moves.length === 0) {
        setOptionSquares({});
        return false;
      }

      const newSquares: Record<string, React.CSSProperties> = {};
      moves.forEach((move: Move) => {
        newSquares[move.to] = {
          background:
            game.get(move.to as Square) &&
            game.get(move.to as Square)!.color !== game.get(square)!.color
              ? "radial-gradient(circle, rgba(220,38,38,0.6) 85%, transparent 85%)"
              : "radial-gradient(circle, rgba(220,38,38,0.3) 25%, transparent 25%)",
          borderRadius: "50%",
        };
      });

      newSquares[square] = {
        backgroundColor: "rgba(220, 38, 38, 0.3)",
      };

      setOptionSquares(newSquares);
      return true;
    },
    [game],
  );

  // ─── Handle square click (v5 API: { piece, square }) ─────────────────────
  const onSquareClick = useCallback(
    ({ square }: { piece: { pieceType: string } | null; square: string }) => {
      if (game.turn() !== "w" || game.isGameOver()) return;

      setRightClickedSquares({});
      const sq = square as Square;

      // If no piece selected, select this piece
      if (!moveFrom) {
        const piece = game.get(sq);
        if (piece && piece.color === "w") {
          setMoveFrom(sq);
          getMoveOptions(sq);
        }
        return;
      }

      // Try to make the move
      try {
        const piece = game.get(moveFrom);
        const isPromotion =
          piece &&
          piece.type === "p" &&
          ((piece.color === "w" && sq[1] === "8") ||
            (piece.color === "b" && sq[1] === "1"));

        const move = game.move({
          from: moveFrom,
          to: sq,
          promotion: isPromotion ? "q" : undefined,
        });

        if (move) {
          setGameFen(game.fen());
          highlightLastMove(moveFrom, sq);
          setMoveFrom(null);
          setOptionSquares({});
          updateStatus();
          return;
        }
      } catch {
        // Invalid move
      }

      // Try selecting the clicked square as new source
      const piece = game.get(sq);
      if (piece && piece.color === "w") {
        setMoveFrom(sq);
        getMoveOptions(sq);
      } else {
        setMoveFrom(null);
        setOptionSquares({});
      }
    },
    [game, moveFrom, getMoveOptions, highlightLastMove, updateStatus],
  );

  // ─── Handle drag-and-drop (v5 API: { piece, sourceSquare, targetSquare }) ─
  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: { isSparePiece: boolean; position: string; pieceType: string };
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      if (game.turn() !== "w" || game.isGameOver() || !targetSquare)
        return false;

      const from = sourceSquare as Square;
      const to = targetSquare as Square;

      const gamePiece = game.get(from);
      const isPromotion =
        gamePiece &&
        gamePiece.type === "p" &&
        ((gamePiece.color === "w" && to[1] === "8") ||
          (gamePiece.color === "b" && to[1] === "1"));

      try {
        const move = game.move({
          from,
          to,
          promotion: isPromotion ? "q" : undefined,
        });

        if (!move) return false;

        setGameFen(game.fen());
        setMoveFrom(null);
        setOptionSquares({});
        highlightLastMove(from, to);
        updateStatus();
        return true;
      } catch {
        return false;
      }
    },
    [game, highlightLastMove, updateStatus],
  );

  // ─── Handle right-click highlighting ─────────────────────────────────────
  const onSquareRightClick = useCallback(
    ({ square }: { piece: { pieceType: string } | null; square: string }) => {
      setRightClickedSquares((prev) => {
        const color = "rgba(220, 38, 38, 0.5)";
        const newSquares = { ...prev };
        if (newSquares[square]?.backgroundColor === color) {
          delete newSquares[square];
        } else {
          newSquares[square] = { backgroundColor: color };
        }
        return newSquares;
      });
    },
    [],
  );

  // ─── Reset the game ──────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    game.reset();
    setGameFen(game.fen());
    setGameStatus("playing");
    setMoveFrom(null);
    setOptionSquares({});
    setLastMoveSquares({});
    setRightClickedSquares({});
    isThinkingRef.current = false;
  }, [game]);

  // ─── Custom square styles (merge all overlays) ───────────────────────────
  const customSquareStyles = useMemo(
    () => ({
      ...lastMoveSquares,
      ...optionSquares,
      ...rightClickedSquares,
    }),
    [lastMoveSquares, optionSquares, rightClickedSquares],
  );

  // ─── Status message ──────────────────────────────────────────────────────
  const statusMessage = useMemo(() => {
    switch (gameStatus) {
      case "thinking":
        return {
          text: `${coach.name} is thinking…`,
          color: "text-gray-500",
          icon: "⏳",
        };
      case "check":
        return { text: "Check!", color: "text-warning-orange", icon: "⚡" };
      case "checkmate-win":
        return {
          text: "Checkmate — You win!",
          color: "text-success-green",
          icon: "🎉",
        };
      case "checkmate-lose":
        return {
          text: `Checkmate — ${coach.name} wins!`,
          color: "text-primary-red",
          icon: "👑",
        };
      case "stalemate":
        return {
          text: "Stalemate — Draw",
          color: "text-gray-500",
          icon: "🤝",
        };
      case "draw":
        return { text: "Draw", color: "text-gray-500", icon: "🤝" };
      default:
        return { text: "Your turn", color: "text-gray-600", icon: "♟️" };
    }
  }, [gameStatus, coach.name]);

  // ─── Evaluation Bar Math ─────────────────────────────────────────────────
  const evalValue = useMemo(() => {
    if (!evaluation) return { percentage: 50, text: "0.0" };

    let score = evaluation.value;
    // Normalize score to be from White's perspective
    if (evaluation.turn === "b") {
      score = -score;
    }

    if (evaluation.type === "mate") {
      const isWhiteWinning = score > 0;
      return {
        percentage: isWhiteWinning ? 100 : 0,
        text: `M${Math.abs(score)}`,
        isMate: true,
        isWhiteWinning,
      };
    }

    // Convert centipawns to pawns
    const pawns = score / 100;

    // Clamp pawns between -10 and +10, then map to 5% - 95%
    // We use a sigmoid-like clamping so small advantages are visible but large advantages don't just snap to 100%
    const clampedPawns = Math.max(-10, Math.min(10, pawns));
    const percentage = 50 + (clampedPawns / 10) * 45;

    const formattedText = pawns > 0 ? `+${pawns.toFixed(1)}` : pawns.toFixed(1);

    return {
      percentage,
      text: formattedText,
      isMate: false,
      isWhiteWinning: pawns > 0,
    };
  }, [evaluation]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 py-4 lg:py-0 animate-[fade-in-up_1.2s_ease-out]">
      {/* Bot Profile Card */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm w-full max-w-[480px]">
        <div className="relative">
          <Image
            src={coach.avatar}
            alt={`${coach.name} — Chess Coach`}
            width={44}
            height={44}
            className="rounded-full border-2 border-primary-red shadow-md object-cover"
          />
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success-green rounded-full border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-bold text-gray-900 text-sm">
              {coach.name}
            </span>
            <span className="text-xs bg-primary-red/10 text-primary-red px-1.5 py-0.5 rounded-full font-semibold">
              BOT
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Eval</span>
          <button
            onClick={() => setShowEvalBar(!showEvalBar)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:ring-offset-2 ${showEvalBar ? "bg-primary-red" : "bg-gray-200"}`}
            role="switch"
            aria-checked={showEvalBar}
          >
            <span className="sr-only">Toggle evaluation bar</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute left-0 inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showEvalBar ? "translate-x-4.5" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      </div>

      {/* Chessboard & Eval Bar Container */}
      <div className="flex w-full max-w-[480px] gap-3">
        {/* Chessboard */}
        <div className="flex-1 aspect-square relative rounded-xl overflow-hidden shadow-2xl shadow-gray-900/20 border-2 border-gray-200">
          <Chessboard
            options={{
              id: "caissa-chess-board",
              position: gameFen,
              onPieceDrop: onPieceDrop,
              onSquareClick: onSquareClick,
              onSquareRightClick: onSquareRightClick,
              squareStyles: customSquareStyles,
              darkSquareStyle: customDarkSquareStyle,
              lightSquareStyle: customLightSquareStyle,
              boardStyle: {
                borderRadius: "0.625rem",
              },
              boardOrientation: "white",
              animationDurationInMs: 200,
              allowDragging: game.turn() === "w" && !game.isGameOver(),
            }}
          />

          {/* Thinking overlay */}
          {gameStatus === "thinking" && (
            <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary-red rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-primary-red rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-primary-red rounded-full animate-bounce" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Thinking…
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Evaluation Bar */}
        {showEvalBar && (
          <div className="w-6 shrink-0 bg-[#333333] rounded-md overflow-hidden flex flex-col justify-end border-2 border-gray-200 relative shadow-inner">
            {/* White advantage bar (grows from bottom) */}
            <div
              className="w-full bg-white transition-[height] duration-500 ease-out relative"
              style={{ height: `${evalValue.percentage}%` }}
            >
              {evalValue.isWhiteWinning && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-800 z-10 leading-none">
                  {evalValue.text}
                </span>
              )}
            </div>

            {/* Black advantage text (shown in the black/dark area) */}
            {!evalValue.isWhiteWinning && (
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white z-10 leading-none">
                {evalValue.text}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Game Status & Controls */}
      <div className="flex items-center justify-between w-full max-w-[480px] bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-base">{statusMessage.icon}</span>
          <span className={`text-sm font-semibold ${statusMessage.color}`}>
            {statusMessage.text}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(gameStatus === "checkmate-win" ||
            gameStatus === "checkmate-lose" ||
            gameStatus === "stalemate" ||
            gameStatus === "draw") && (
            <button
              onClick={resetGame}
              className="flex items-center gap-1.5 bg-primary-red hover:bg-accent-red text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              Rematch
            </button>
          )}
          <button
            onClick={resetGame}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
            title="New Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

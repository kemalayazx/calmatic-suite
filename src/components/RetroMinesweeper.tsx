"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
  isKiller: boolean; // the mine that ended the game
}

type Difficulty = "beginner" | "intermediate" | "expert";

interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
}

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  beginner:     { rows: 9,  cols: 9,  mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert:       { rows: 16, cols: 30, mines: 99 },
};

const NUMBER_COLORS: Record<number, string> = {
  1: "#0000ff",
  2: "#008000",
  3: "#ff0000",
  4: "#000080",
  5: "#800000",
  6: "#008080",
  7: "#000000",
  8: "#808080",
};

export interface RetroMinesweeperProps {
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
}

// ── useDrag ───────────────────────────────────────────────────────────────────

function useDrag(initialX: number, initialY: number) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(true);
      dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    },
    [pos]
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  return { pos, onMouseDown };
}

// ── Board helpers ─────────────────────────────────────────────────────────────

function createEmptyBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
      isKiller: false,
    }))
  );
}

function placeMines(
  board: Cell[][],
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number
): Cell[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  let placed = 0;

  // Build exclusion set: the first-click cell and its 8 neighbors
  const excluded = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = safeRow + dr;
      const c = safeCol + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        excluded.add(`${r},${c}`);
      }
    }
  }

  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!newBoard[r][c].isMine && !excluded.has(`${r},${c}`)) {
      newBoard[r][c].isMine = true;
      placed++;
    }
  }

  // Calculate neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
            count++;
          }
        }
      }
      newBoard[r][c].neighborCount = count;
    }
  }

  return newBoard;
}

function floodReveal(
  board: Cell[][],
  rows: number,
  cols: number,
  startRow: number,
  startCol: number
): Cell[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const queue: [number, number][] = [[startRow, startCol]];
  const visited = new Set<string>();
  visited.add(`${startRow},${startCol}`);

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    if (newBoard[r][c].isFlagged) continue;
    newBoard[r][c].isRevealed = true;

    if (newBoard[r][c].neighborCount === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          const key = `${nr},${nc}`;
          if (
            nr >= 0 && nr < rows &&
            nc >= 0 && nc < cols &&
            !visited.has(key) &&
            !newBoard[nr][nc].isMine &&
            !newBoard[nr][nc].isRevealed
          ) {
            visited.add(key);
            queue.push([nr, nc]);
          }
        }
      }
    }
  }

  return newBoard;
}

function revealAllMines(board: Cell[][], killerRow: number, killerCol: number): Cell[][] {
  return board.map((row, r) =>
    row.map((cell, c) => {
      if (cell.isMine) {
        return {
          ...cell,
          isRevealed: true,
          isKiller: r === killerRow && c === killerCol,
        };
      }
      return { ...cell };
    })
  );
}

// ── LED display ───────────────────────────────────────────────────────────────

function LEDDisplay({ value }: { value: number }) {
  const display = Math.max(-99, Math.min(999, value));
  const str = display < 0
    ? `-${Math.abs(display).toString().padStart(2, "0")}`
    : display.toString().padStart(3, "0");

  return (
    <div
      style={{
        background: "#000",
        color: "#ff0000",
        fontFamily: "'Courier New', 'Lucida Console', monospace",
        fontSize: "20px",
        fontWeight: "bold",
        letterSpacing: "2px",
        padding: "2px 4px",
        minWidth: "40px",
        textAlign: "right",
        border: "2px inset #808080",
        lineHeight: 1.2,
        userSelect: "none",
      }}
    >
      {str}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RetroMinesweeper({
  onClose,
  onFocus,
  zIndex,
}: RetroMinesweeperProps) {
  const { pos, onMouseDown: onTitleMouseDown } = useDrag(120, 60);

  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [board, setBoard] = useState<Cell[][]>(() =>
    createEmptyBoard(DIFFICULTIES.beginner.rows, DIFFICULTIES.beginner.cols)
  );
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [minesLeft, setMinesLeft] = useState(DIFFICULTIES.beginner.mines);
  const [seconds, setSeconds] = useState(0);
  const [facePressed, setFacePressed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { rows, cols, mines } = DIFFICULTIES[difficulty];

  // Timer
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setSeconds((s) => Math.min(999, s + 1));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const startNewGame = useCallback(
    (diff?: Difficulty) => {
      const d = diff ?? difficulty;
      const cfg = DIFFICULTIES[d];
      setDifficulty(d);
      setBoard(createEmptyBoard(cfg.rows, cfg.cols));
      setGameState("idle");
      setMinesLeft(cfg.mines);
      setSeconds(0);
      setShowMenu(false);
    },
    [difficulty]
  );

  // Win check
  const checkWin = useCallback(
    (b: Cell[][]): boolean => {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!b[r][c].isMine && !b[r][c].isRevealed) return false;
        }
      }
      return true;
    },
    [rows, cols]
  );

  // Left click — reveal
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameState === "won" || gameState === "lost") return;
      const cell = board[row][col];
      if (cell.isRevealed || cell.isFlagged) return;

      let currentBoard = board;

      // First click — place mines
      if (gameState === "idle") {
        currentBoard = placeMines(
          createEmptyBoard(rows, cols),
          rows,
          cols,
          mines,
          row,
          col
        );
        setGameState("playing");
      }

      const clickedCell = currentBoard[row][col];

      if (clickedCell.isMine) {
        // Game over
        const lostBoard = revealAllMines(currentBoard, row, col);
        setBoard(lostBoard);
        setGameState("lost");
        return;
      }

      // Flood reveal
      const newBoard = floodReveal(currentBoard, rows, cols, row, col);
      setBoard(newBoard);

      if (checkWin(newBoard)) {
        setGameState("won");
      }
    },
    [board, gameState, rows, cols, mines, checkWin]
  );

  // Right click — flag
  const handleCellRightClick = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (gameState === "won" || gameState === "lost") return;
      if (gameState === "idle") return; // can't flag before game starts
      const cell = board[row][col];
      if (cell.isRevealed) return;

      const newBoard = board.map((r) => r.map((c) => ({ ...c })));
      newBoard[row][col].isFlagged = !cell.isFlagged;
      setBoard(newBoard);
      setMinesLeft((prev) => prev + (cell.isFlagged ? 1 : -1));
    },
    [board, gameState]
  );

  // Chord — middle click or aux button
  const handleChord = useCallback(
    (row: number, col: number) => {
      if (gameState !== "playing") return;
      const cell = board[row][col];
      if (!cell.isRevealed || cell.neighborCount === 0) return;

      // Count adjacent flags
      let flagCount = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr;
          const nc = col + dc;
          if (
            nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
            board[nr][nc].isFlagged
          ) {
            flagCount++;
          }
        }
      }

      if (flagCount !== cell.neighborCount) return;

      // Reveal all non-flagged neighbors
      let currentBoard = board.map((r) => r.map((c) => ({ ...c })));
      let lost = false;
      let killerR = -1, killerC = -1;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr;
          const nc = col + dc;
          if (
            nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
            !currentBoard[nr][nc].isFlagged &&
            !currentBoard[nr][nc].isRevealed
          ) {
            if (currentBoard[nr][nc].isMine) {
              lost = true;
              killerR = nr;
              killerC = nc;
            } else {
              currentBoard = floodReveal(currentBoard, rows, cols, nr, nc);
            }
          }
        }
      }

      if (lost) {
        setBoard(revealAllMines(currentBoard, killerR, killerC));
        setGameState("lost");
      } else {
        setBoard(currentBoard);
        if (checkWin(currentBoard)) setGameState("won");
      }
    },
    [board, gameState, rows, cols, checkWin]
  );

  // Face emoji
  const faceEmoji = useMemo(() => {
    if (facePressed) return "😮";
    if (gameState === "won") return "😎";
    if (gameState === "lost") return "💀";
    return "😊";
  }, [facePressed, gameState]);

  // Cell style
  const getCellStyle = useCallback(
    (cell: Cell, _row: number, _col: number): React.CSSProperties => {
      const base: React.CSSProperties = {
        width: 16,
        height: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "bold",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        cursor: "default",
        userSelect: "none",
        boxSizing: "border-box",
        flexShrink: 0,
      };

      if (!cell.isRevealed) {
        return {
          ...base,
          background: "#c0c0c0",
          border: "2px outset #ffffff",
          cursor: gameState === "won" || gameState === "lost" ? "default" : "pointer",
        };
      }

      // Revealed
      return {
        ...base,
        background: cell.isKiller ? "#ff0000" : "#c0c0c0",
        border: "1px solid #808080",
        fontSize: "12px",
        color: cell.neighborCount > 0 ? NUMBER_COLORS[cell.neighborCount] : "transparent",
      };
    },
    [gameState]
  );

  // Cell content
  const getCellContent = useCallback((cell: Cell): string => {
    if (!cell.isRevealed) {
      return cell.isFlagged ? "🚩" : "";
    }
    if (cell.isMine) return "💣";
    if (cell.neighborCount > 0) return cell.neighborCount.toString();
    return "";
  }, []);

  // Window width driven by grid
  const gridWidth = cols * 16;
  const windowWidth = Math.max(200, gridWidth + 20); // 2*border + 2*padding inner

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex,
        background: "#c0c0c0",
        border: "2px outset #ffffff",
        boxShadow: "2px 2px 0 #000",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        userSelect: "none",
        width: windowWidth + 8,
      }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        style={{
          background: "linear-gradient(90deg, #000080, #1084d0)",
          color: "#fff",
          padding: "3px 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "move",
          fontSize: "12px",
          fontWeight: "bold",
        }}
        onMouseDown={onTitleMouseDown}
      >
        <span>💣 Minesweeper</span>
        <div style={{ display: "flex", gap: "2px" }}>
          <button
            style={{
              width: 16, height: 14, fontSize: "10px",
              background: "#c0c0c0", border: "1px outset #fff",
              cursor: "pointer", padding: 0, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Menu bar */}
      <div
        style={{
          background: "#c0c0c0",
          borderBottom: "1px solid #808080",
          fontSize: "12px",
          display: "flex",
          position: "relative",
        }}
      >
        <button
          style={{
            background: showMenu ? "#000080" : "transparent",
            color: showMenu ? "#fff" : "#000",
            border: "none",
            padding: "2px 8px",
            cursor: "pointer",
            fontSize: "12px",
          }}
          onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
        >
          Game
        </button>

        {showMenu && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              background: "#c0c0c0",
              border: "2px outset #fff",
              boxShadow: "2px 2px 0 #000",
              zIndex: 9999,
              minWidth: 160,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(["New Game", "---", "Beginner", "Intermediate", "Expert"] as const).map(
              (item) => {
                if (item === "---") {
                  return (
                    <div
                      key="sep"
                      style={{ borderTop: "1px solid #808080", margin: "2px 4px" }}
                    />
                  );
                }
                const isSelected =
                  (item === "Beginner" && difficulty === "beginner") ||
                  (item === "Intermediate" && difficulty === "intermediate") ||
                  (item === "Expert" && difficulty === "expert");
                return (
                  <div
                    key={item}
                    style={{
                      padding: "3px 24px 3px 16px",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "#000080";
                      (e.currentTarget as HTMLDivElement).style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                      (e.currentTarget as HTMLDivElement).style.color = "#000";
                    }}
                    onClick={() => {
                      if (item === "New Game") {
                        startNewGame();
                      } else {
                        const diffMap: Record<string, Difficulty> = {
                          Beginner: "beginner",
                          Intermediate: "intermediate",
                          Expert: "expert",
                        };
                        startNewGame(diffMap[item]);
                      }
                    }}
                  >
                    <span style={{ width: 12, fontSize: "10px" }}>
                      {isSelected ? "•" : ""}
                    </span>
                    <span>{item}</span>
                    {item === "Beginner" && (
                      <span style={{ marginLeft: "auto", fontSize: "10px", color: "#555" }}>
                        9×9
                      </span>
                    )}
                    {item === "Intermediate" && (
                      <span style={{ marginLeft: "auto", fontSize: "10px", color: "#555" }}>
                        16×16
                      </span>
                    )}
                    {item === "Expert" && (
                      <span style={{ marginLeft: "auto", fontSize: "10px", color: "#555" }}>
                        30×16
                      </span>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Game area */}
      <div
        style={{
          padding: "6px",
          background: "#c0c0c0",
        }}
        onClick={() => setShowMenu(false)}
      >
        {/* Header: mine counter + face + timer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#c0c0c0",
            border: "2px inset #808080",
            padding: "4px 6px",
            marginBottom: "6px",
          }}
        >
          <LEDDisplay value={minesLeft} />

          {/* Smiley button */}
          <button
            style={{
              background: "#c0c0c0",
              border: facePressed ? "2px inset #808080" : "2px outset #fff",
              width: 26,
              height: 26,
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              lineHeight: 1,
            }}
            onMouseDown={() => setFacePressed(true)}
            onMouseUp={() => { setFacePressed(false); startNewGame(); }}
            onMouseLeave={() => setFacePressed(false)}
          >
            {faceEmoji}
          </button>

          <LEDDisplay value={seconds} />
        </div>

        {/* Grid */}
        <div
          style={{
            border: "3px inset #808080",
            display: "inline-block",
            lineHeight: 0,
          }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {board.map((row, r) => (
            <div key={r} style={{ display: "flex" }}>
              {row.map((cell, c) => (
                <div
                  key={c}
                  style={getCellStyle(cell, r, c)}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleCellRightClick(e, r, c)}
                  onAuxClick={(e) => {
                    if (e.button === 1) { e.preventDefault(); handleChord(r, c); }
                  }}
                  onMouseDown={(e) => {
                    if (e.button === 0 && !cell.isRevealed && !cell.isFlagged) {
                      setFacePressed(true);
                    }
                    // Left+Right chord
                    if (e.buttons === 3) {
                      handleChord(r, c);
                    }
                  }}
                  onMouseUp={(e) => {
                    if (e.button === 0) setFacePressed(false);
                  }}
                >
                  {getCellContent(cell)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Game over / win message */}
        {(gameState === "won" || gameState === "lost") && (
          <div
            style={{
              marginTop: "6px",
              textAlign: "center",
              fontSize: "12px",
              fontWeight: "bold",
              color: gameState === "won" ? "#006400" : "#cc0000",
            }}
          >
            {gameState === "won" ? "You Win! 🎉" : "Game Over!"}
          </div>
        )}
      </div>
    </div>
  );
}

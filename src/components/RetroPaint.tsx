"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Tool = "pencil" | "line" | "rect" | "ellipse" | "fill" | "eraser" | "text" | "picker";
type BrushSize = 1 | 3 | 5;

interface RetroPaintProps {
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
}

// ── Win95 28-color palette ────────────────────────────────────────────────────

const PALETTE_COLORS = [
  // Row 1
  "#000000", "#808080", "#800000", "#808000", "#008000", "#008080",
  "#000080", "#800080", "#808040", "#004040", "#0080FF", "#004080",
  "#8000FF", "#804000",
  // Row 2
  "#FFFFFF", "#C0C0C0", "#FF0000", "#FFFF00", "#00FF00", "#00FFFF",
  "#0000FF", "#FF00FF", "#FFFF80", "#00FF80", "#80FFFF", "#0080FF",
  "#FF0080", "#FF8000",
];

// ── useDrag hook ──────────────────────────────────────────────────────────────

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

// ── Flood fill (BFS) ─────────────────────────────────────────────────────────

function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string,
  width: number,
  height: number
) {
  // Parse fill color to RGBA
  const tmp = document.createElement("canvas");
  tmp.width = tmp.height = 1;
  const tc = tmp.getContext("2d")!;
  tc.fillStyle = fillColor;
  tc.fillRect(0, 0, 1, 1);
  const fc = tc.getImageData(0, 0, 1, 1).data;
  const [fr, fg, fb, fa] = [fc[0], fc[1], fc[2], fc[3]];

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const idx = (x: number, y: number) => (y * width + x) * 4;
  const si = idx(startX, startY);
  const [tr, tg, tb, ta] = [data[si], data[si + 1], data[si + 2], data[si + 3]];

  // If target color == fill color, nothing to do
  if (tr === fr && tg === fg && tb === fb && ta === fa) return;

  const matches = (i: number) =>
    data[i] === tr && data[i + 1] === tg && data[i + 2] === tb && data[i + 3] === ta;

  const queue: number[] = [];
  const visited = new Uint8Array(width * height);

  const push = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const flat = y * width + x;
    if (visited[flat]) return;
    if (!matches(flat * 4)) return;
    visited[flat] = 1;
    queue.push(x, y);
  };

  push(startX, startY);

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const i = idx(x, y);
    data[i] = fr;
    data[i + 1] = fg;
    data[i + 2] = fb;
    data[i + 3] = fa;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  ctx.putImageData(imageData, 0, 0);
}

// ── ToolIcon ─────────────────────────────────────────────────────────────────

function ToolIcon({ tool }: { tool: Tool }) {
  switch (tool) {
    case "pencil":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <line x1="12" y1="2" x2="4" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4" y1="14" x2="2" y2="14" stroke="currentColor" strokeWidth="1" />
          <line x1="2" y1="14" x2="4" y2="12" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case "line":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "rect":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="2" y="4" width="12" height="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "ellipse":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <ellipse cx="8" cy="8" rx="6" ry="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "fill":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M3 13 L8 2 L9 2 L14 13 Z" fill="currentColor" opacity="0.6" />
          <rect x="2" y="13" width="12" height="2" fill="currentColor" />
        </svg>
      );
    case "eraser":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="2" y="7" width="12" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="7" y1="7" x2="7" y2="13" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case "text":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <text x="2" y="13" fontSize="13" fontFamily="serif" fontWeight="bold" fill="currentColor">A</text>
        </svg>
      );
    case "picker":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="5" cy="11" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="7" y1="9" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RetroPaint({ onClose, onFocus, zIndex }: RetroPaintProps) {
  const { pos, onMouseDown: titleDragStart } = useDrag(60, 40);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Scratch canvas for preview shapes
  const scratchRef = useRef<HTMLCanvasElement>(null);

  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [brushSize, setBrushSize] = useState<BrushSize>(3);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [editMenuOpen, setEditMenuOpen] = useState(false);

  // Drawing state
  const drawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const shapeStart = useRef({ x: 0, y: 0 });

  // Text tool state
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);
  const textRef = useRef<HTMLInputElement>(null);

  const CANVAS_W = 480;
  const CANVAS_H = 320;

  // ── Init white canvas ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  // ── Focus text input when text tool active ──────────────────────────────────
  useEffect(() => {
    if (textInput) textRef.current?.focus();
  }, [textInput]);

  // ── Canvas coords from event ────────────────────────────────────────────────
  function getCanvasXY(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    };
  }

  // ── Commit scratch to main canvas ──────────────────────────────────────────
  function commitScratch() {
    const main = canvasRef.current;
    const scratch = scratchRef.current;
    if (!main || !scratch) return;
    const ctx = main.getContext("2d")!;
    ctx.drawImage(scratch, 0, 0);
    // Clear scratch
    const sc = scratch.getContext("2d")!;
    sc.clearRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // ── Draw preview on scratch ─────────────────────────────────────────────────
  function drawPreview(x: number, y: number) {
    const scratch = scratchRef.current;
    if (!scratch) return;
    const sc = scratch.getContext("2d")!;
    sc.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const sx = shapeStart.current.x;
    const sy = shapeStart.current.y;

    sc.strokeStyle = fgColor;
    sc.lineWidth = brushSize;
    sc.lineCap = "round";

    if (activeTool === "line") {
      sc.beginPath();
      sc.moveTo(sx, sy);
      sc.lineTo(x, y);
      sc.stroke();
    } else if (activeTool === "rect") {
      sc.beginPath();
      sc.strokeRect(sx, sy, x - sx, y - sy);
    } else if (activeTool === "ellipse") {
      sc.beginPath();
      const rx = Math.abs(x - sx) / 2;
      const ry = Math.abs(y - sy) / 2;
      const cx = sx + (x - sx) / 2;
      const cy = sy + (y - sy) / 2;
      sc.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      sc.stroke();
    }
  }

  // ── Mouse events ────────────────────────────────────────────────────────────

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    // Don't let this bubble to the titlebar drag
    e.stopPropagation();
    const { x, y } = getCanvasXY(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    if (activeTool === "fill") {
      const color = e.button === 2 ? bgColor : fgColor;
      floodFill(ctx, x, y, color, CANVAS_W, CANVAS_H);
      return;
    }

    if (activeTool === "picker") {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex =
        "#" +
        [pixel[0], pixel[1], pixel[2]]
          .map((v) => v.toString(16).padStart(2, "0"))
          .join("");
      if (e.button === 2) setBgColor(hex);
      else setFgColor(hex);
      return;
    }

    if (activeTool === "text") {
      setTextInput({ x, y, value: "" });
      return;
    }

    drawing.current = true;
    lastPoint.current = { x, y };
    shapeStart.current = { x, y };

    if (activeTool === "pencil" || activeTool === "eraser") {
      const color = activeTool === "eraser" ? bgColor : fgColor;
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const { x, y } = getCanvasXY(e);
    setCursorPos({ x, y });

    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    if (activeTool === "pencil" || activeTool === "eraser") {
      const color = activeTool === "eraser" ? bgColor : fgColor;
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = activeTool === "eraser" ? brushSize * 2 : brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      lastPoint.current = { x, y };
    } else if (["line", "rect", "ellipse"].includes(activeTool)) {
      drawPreview(x, y);
    }
  }

  function handleCanvasMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current = false;
    const { x, y } = getCanvasXY(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    if (["line", "rect", "ellipse"].includes(activeTool)) {
      const sx = shapeStart.current.x;
      const sy = shapeStart.current.y;
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";

      if (activeTool === "line") {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (activeTool === "rect") {
        ctx.beginPath();
        ctx.strokeRect(sx, sy, x - sx, y - sy);
      } else if (activeTool === "ellipse") {
        const rx = Math.abs(x - sx) / 2;
        const ry = Math.abs(y - sy) / 2;
        const cx = sx + (x - sx) / 2;
        const cy = sy + (y - sy) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Clear scratch preview
      const scratch = scratchRef.current;
      if (scratch) {
        const sc = scratch.getContext("2d")!;
        sc.clearRect(0, 0, CANVAS_W, CANVAS_H);
      }
    }
  }

  function handleCanvasMouseLeave() {
    if (drawing.current) {
      drawing.current = false;
      commitScratch();
    }
  }

  // ── Clear canvas ─────────────────────────────────────────────────────────────
  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    setEditMenuOpen(false);
  }

  // ── Commit text ──────────────────────────────────────────────────────────────
  function commitText() {
    if (!textInput) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = fgColor;
    ctx.font = `${brushSize * 5 + 8}px 'Segoe UI', Tahoma, sans-serif`;
    ctx.fillText(textInput.value, textInput.x, textInput.y);
    setTextInput(null);
  }

  // ── Tool list ────────────────────────────────────────────────────────────────
  const TOOLS: Tool[] = ["pencil", "line", "rect", "ellipse", "fill", "eraser", "text", "picker"];
  const TOOL_LABELS: Record<Tool, string> = {
    pencil: "Pencil",
    line: "Line",
    rect: "Rectangle",
    ellipse: "Ellipse",
    fill: "Fill",
    eraser: "Eraser",
    text: "Text",
    picker: "Color Picker",
  };

  const W95 = {
    bg: "#c0c0c0",
    outset: "2px outset #ffffff",
    inset: "2px inset #808080",
    font: "'Segoe UI', Tahoma, sans-serif",
  };

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex,
        width: "600px",
        background: W95.bg,
        border: W95.outset,
        boxShadow: "2px 2px 0 #000",
        fontFamily: W95.font,
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseDown={onFocus}
    >
      {/* ── Title bar ──────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(90deg, #000080, #1084d0)",
          color: "#fff",
          padding: "3px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "move",
          fontSize: "13px",
          fontWeight: "bold",
        }}
        onMouseDown={(e) => {
          // Only drag from title bar itself
          titleDragStart(e);
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="1" fill="#c0c0c0" />
            <rect x="2" y="2" width="5" height="5" fill="#FF0000" />
            <rect x="9" y="2" width="5" height="5" fill="#00FF00" />
            <rect x="2" y="9" width="5" height="5" fill="#0000FF" />
            <rect x="9" y="9" width="5" height="5" fill="#FFFF00" />
          </svg>
          untitled - Paint
        </span>
        <div style={{ display: "flex", gap: "2px" }}>
          {["_", "□"].map((lbl) => (
            <button
              key={lbl}
              style={{
                width: "18px",
                height: "16px",
                background: W95.bg,
                border: W95.outset,
                cursor: "default",
                fontSize: "11px",
                lineHeight: 1,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {lbl}
            </button>
          ))}
          <button
            style={{
              width: "18px",
              height: "16px",
              background: W95.bg,
              border: W95.outset,
              cursor: "pointer",
              fontSize: "11px",
              lineHeight: 1,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Menu bar ───────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "0",
          padding: "2px 4px",
          fontSize: "13px",
          borderBottom: "1px solid #808080",
          position: "relative",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {["File", "View", "Image", "Colors", "Help"].map((m) => (
          <span
            key={m}
            style={{
              padding: "2px 8px",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#000080";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#000";
            }}
          >
            {m}
          </span>
        ))}
        {/* Edit with dropdown for Clear */}
        <div style={{ position: "relative" }}>
          <span
            style={{
              padding: "2px 8px",
              cursor: "default",
              background: editMenuOpen ? "#000080" : "transparent",
              color: editMenuOpen ? "#fff" : "#000",
              display: "block",
            }}
            onClick={() => setEditMenuOpen((v) => !v)}
          >
            Edit
          </span>
          {editMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: W95.bg,
                border: W95.outset,
                zIndex: 9999,
                minWidth: "140px",
                boxShadow: "2px 2px 0 #000",
              }}
            >
              <div
                style={{
                  padding: "4px 20px",
                  fontSize: "13px",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#000080";
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#000";
                }}
                onClick={clearCanvas}
              >
                Clear Image
              </div>
              <div
                style={{ height: "1px", background: "#808080", margin: "2px 4px" }}
              />
              <div
                style={{
                  padding: "4px 20px",
                  fontSize: "13px",
                  cursor: "default",
                  color: "#808080",
                }}
              >
                Undo&nbsp;&nbsp;&nbsp;&nbsp;Ctrl+Z
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Body: toolbar + canvas ──────────────────────────────────────────── */}
      <div
        style={{ display: "flex", flex: 1 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* ── Left toolbar ─────────────────────────────────────────────────── */}
        <div
          style={{
            width: "32px",
            background: W95.bg,
            borderRight: "1px solid #808080",
            padding: "4px 4px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {TOOLS.map((tool) => (
            <button
              key={tool}
              title={TOOL_LABELS[tool]}
              onClick={() => {
                setActiveTool(tool);
                setTextInput(null);
              }}
              style={{
                width: "24px",
                height: "24px",
                background: W95.bg,
                border: activeTool === tool ? W95.inset : W95.outset,
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
              }}
            >
              <ToolIcon tool={tool} />
            </button>
          ))}

          {/* Brush sizes */}
          <div style={{ height: "4px" }} />
          <div style={{ fontSize: "9px", textAlign: "center", color: "#555", lineHeight: 1 }}>Size</div>
          {([1, 3, 5] as BrushSize[]).map((s) => (
            <button
              key={s}
              title={`${s}px`}
              onClick={() => setBrushSize(s)}
              style={{
                width: "24px",
                height: "16px",
                background: W95.bg,
                border: brushSize === s ? W95.inset : W95.outset,
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: `${s * 2 + 2}px`,
                  height: `${s === 1 ? 1 : s === 3 ? 2 : 3}px`,
                  background: "#000",
                  borderRadius: "1px",
                }}
              />
            </button>
          ))}
        </div>

        {/* ── Canvas area ──────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            background: "#808080",
            padding: "4px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Main canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              display: "block",
              cursor:
                activeTool === "fill"
                  ? "cell"
                  : activeTool === "eraser"
                  ? "crosshair"
                  : activeTool === "text"
                  ? "text"
                  : activeTool === "picker"
                  ? "crosshair"
                  : "crosshair",
              border: W95.inset,
              background: "#fff",
              position: "relative",
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
            onContextMenu={(e) => e.preventDefault()}
          />
          {/* Scratch canvas for preview (overlaid) */}
          <canvas
            ref={scratchRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              position: "absolute",
              top: "4px",
              left: "4px",
              pointerEvents: "none",
              border: W95.inset,
            }}
          />
          {/* Text input overlay */}
          {textInput && (
            <input
              ref={textRef}
              type="text"
              value={textInput.value}
              onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitText();
                if (e.key === "Escape") setTextInput(null);
              }}
              onBlur={commitText}
              style={{
                position: "absolute",
                left: `${textInput.x + 4}px`,
                top: `${textInput.y + 4 - brushSize * 5 - 8}px`,
                background: "transparent",
                border: "1px dashed #000",
                outline: "none",
                font: `${brushSize * 5 + 8}px 'Segoe UI', Tahoma, sans-serif`,
                color: fgColor,
                minWidth: "80px",
                padding: "0 2px",
              }}
            />
          )}
        </div>
      </div>

      {/* ── Color palette ──────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid #808080",
          padding: "4px 6px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: W95.bg,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* FG/BG color indicator */}
        <div style={{ position: "relative", width: "28px", height: "28px", flexShrink: 0 }}>
          {/* BG square (behind) */}
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "18px",
              height: "18px",
              background: bgColor,
              border: W95.inset,
            }}
          />
          {/* FG square (front) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "18px",
              height: "18px",
              background: fgColor,
              border: W95.outset,
            }}
          />
        </div>

        {/* Color grid: 2 rows × 14 cols */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 14px)", gap: "1px" }}>
          {PALETTE_COLORS.map((color) => (
            <div
              key={color}
              title={color}
              style={{
                width: "12px",
                height: "12px",
                background: color,
                border: "1px solid #808080",
                cursor: "pointer",
                outline: fgColor === color ? "1px solid #000" : "none",
                outlineOffset: "1px",
              }}
              onClick={() => setFgColor(color)}
              onContextMenu={(e) => {
                e.preventDefault();
                setBgColor(color);
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Status bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid #808080",
          padding: "2px 8px",
          fontSize: "12px",
          display: "flex",
          gap: "16px",
          background: W95.bg,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span style={{ border: W95.inset, padding: "0 6px" }}>
          {cursorPos.x},{cursorPos.y}
        </span>
        <span style={{ border: W95.inset, padding: "0 6px" }}>
          {CANVAS_W}×{CANVAS_H}
        </span>
        <span style={{ border: W95.inset, padding: "0 6px", flex: 1 }}>
          Tool: {TOOL_LABELS[activeTool]}
        </span>
      </div>
    </div>
  );
}

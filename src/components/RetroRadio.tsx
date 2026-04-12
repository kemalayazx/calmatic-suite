"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── SomaFM free streams ───────────────────────────────────────────────────────
const STATIONS = [
  { id: "groovesalad", name: "Groove Salad", desc: "Ambient / downtempo", url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { id: "lush", name: "Lush", desc: "Chillout & ambient", url: "https://ice1.somafm.com/lush-128-mp3" },
  { id: "dronezone", name: "Drone Zone", desc: "Atmospheric textures", url: "https://ice1.somafm.com/dronezone-128-mp3" },
  { id: "deepspaceone", name: "Deep Space One", desc: "Deep ambient electronic", url: "https://ice1.somafm.com/deepspaceone-128-mp3" },
  { id: "thetrip", name: "The Trip", desc: "Progressive & trance", url: "https://ice1.somafm.com/thetrip-128-mp3" },
  { id: "sonicuniverse", name: "Sonic Universe", desc: "Nu-jazz / fusion", url: "https://ice1.somafm.com/sonicuniverse-128-mp3" },
  { id: "bootliquor", name: "Boot Liquor", desc: "Americana / country", url: "https://ice1.somafm.com/bootliquor-128-mp3" },
  { id: "missioncontrol", name: "Mission Control", desc: "Ambient for coders", url: "https://ice1.somafm.com/missioncontrol-128-mp3" },
];

// ── Drag hook (minimal, inline) ───────────────────────────────────────────────
function useDrag(ix: number, iy: number) {
  const [pos, setPos] = useState({ x: ix, y: iy });
  const [drag, setDrag] = useState(false);
  const off = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDrag(true);
    off.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos]);

  useEffect(() => {
    if (!drag) return;
    const move = (e: MouseEvent) => setPos({ x: e.clientX - off.current.x, y: e.clientY - off.current.y });
    const up = () => setDrag(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [drag]);

  return { pos, onMouseDown };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RetroRadio({
  onClose,
  initialZ = 100,
}: {
  onClose: () => void;
  initialZ?: number;
}) {
  const { pos, onMouseDown } = useDrag(window.innerWidth / 2 - 160, 120);
  const [stationIdx, setStationIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const station = STATIONS[stationIdx];

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  function play() {
    if (!audioRef.current) {
      audioRef.current = new Audio(station.url);
      audioRef.current.volume = volume;
    }
    setLoading(true);
    audioRef.current.play().then(() => {
      setPlaying(true);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  function stop() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setPlaying(false);
    setLoading(false);
  }

  function changeStation(idx: number) {
    stop();
    setStationIdx(idx);
  }

  // Auto-play on station change if was playing
  const wasPlaying = useRef(false);
  function handleStationChange(idx: number) {
    wasPlaying.current = playing;
    changeStation(idx);
  }
  useEffect(() => {
    if (wasPlaying.current) {
      wasPlaying.current = false;
      play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationIdx]);

  // Cleanup on unmount
  useEffect(() => () => stop(), []);

  // Equalizer animation bars
  const [barHeights, setBarHeights] = useState([4, 4, 4, 4, 4, 4, 4, 4]);
  useEffect(() => {
    if (!playing) { setBarHeights([4, 4, 4, 4, 4, 4, 4, 4]); return; }
    const id = setInterval(() => {
      setBarHeights(prev => prev.map(() => playing ? 4 + Math.random() * 16 : 4));
    }, 120);
    return () => clearInterval(id);
  }, [playing]);

  const btn: React.CSSProperties = {
    background: "#c0c0c0",
    border: "2px outset #ffffff",
    padding: "3px 10px",
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    fontSize: "11px",
    minWidth: "44px",
  };

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        zIndex: initialZ,
        width: "320px",
        background: "#000",
        border: "2px outset #666",
        fontFamily: "'Courier New', monospace",
        boxShadow: "3px 3px 0 #000",
        userSelect: "none",
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={onMouseDown}
        style={{
          background: "linear-gradient(90deg, #000080, #1084d0)",
          padding: "4px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "move",
          color: "#fff",
          fontSize: "12px",
          fontFamily: "'Segoe UI', Tahoma, sans-serif",
        }}
      >
        <span>♪ Calmatic Radio</span>
        <div style={{ display: "flex", gap: "2px" }}>
          <button
            onClick={onClose}
            style={{
              background: "#c0c0c0",
              border: "1px outset #fff",
              width: "16px", height: "14px",
              cursor: "pointer",
              fontSize: "10px",
              lineHeight: 1,
              fontFamily: "Arial",
              padding: 0,
            }}
          >✕</button>
        </div>
      </div>

      {/* Display panel */}
      <div style={{ background: "#000", padding: "8px 10px" }}>
        {/* Station name */}
        <div style={{
          background: "#0a1a00",
          border: "1px inset #333",
          padding: "6px 8px",
          color: "#33ff33",
          fontSize: "13px",
          letterSpacing: "1px",
          marginBottom: "6px",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}>
          {loading ? "CONNECTING..." : playing ? `▶ ${station.name}` : `■ ${station.name}`}
        </div>

        {/* Description */}
        <div style={{ color: "#666", fontSize: "10px", marginBottom: "8px", paddingLeft: "2px" }}>
          {station.desc}
        </div>

        {/* Equalizer */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "3px",
          height: "24px",
          marginBottom: "8px",
          paddingLeft: "2px",
        }}>
          {barHeights.map((h, i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: `${h}px`,
                background: h > 14 ? "#ff4444" : h > 8 ? "#ffcc00" : "#33ff33",
                transition: "height 0.1s",
              }}
            />
          ))}
          <div style={{ color: "#33ff33", fontSize: "10px", marginLeft: "6px", lineHeight: 1, alignSelf: "center" }}>
            {playing ? "ON AIR" : "OFF"}
          </div>
        </div>

        {/* Volume */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ color: "#666", fontSize: "10px", width: "28px" }}>VOL</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: "#33ff33", cursor: "pointer" }}
          />
          <span style={{ color: "#33ff33", fontSize: "10px", width: "28px", textAlign: "right" }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        background: "#c0c0c0",
        padding: "6px 8px",
        display: "flex",
        gap: "4px",
        borderTop: "1px solid #808080",
      }}>
        <button
          style={btn}
          onClick={() => {
            if (playing) { stop(); } else { play(); }
          }}
        >
          {loading ? "..." : playing ? "■ Stop" : "▶ Play"}
        </button>
        <button
          style={btn}
          onClick={() => handleStationChange((stationIdx - 1 + STATIONS.length) % STATIONS.length)}
        >
          ◀◀
        </button>
        <button
          style={btn}
          onClick={() => handleStationChange((stationIdx + 1) % STATIONS.length)}
        >
          ▶▶
        </button>
      </div>

      {/* Station list */}
      <div style={{
        background: "#1a1a1a",
        borderTop: "1px solid #333",
        maxHeight: "130px",
        overflowY: "auto",
      }}>
        {STATIONS.map((s, i) => (
          <div
            key={s.id}
            onClick={() => handleStationChange(i)}
            style={{
              padding: "4px 10px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: i === stationIdx ? "#003300" : "transparent",
              color: i === stationIdx ? "#33ff33" : "#888",
              fontSize: "11px",
              borderBottom: "1px solid #2a2a2a",
            }}
          >
            <span>{i === stationIdx && playing ? "♪ " : "  "}{s.name}</span>
            <span style={{ fontSize: "10px", color: "#555" }}>{s.desc}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        background: "#000",
        padding: "3px 8px",
        color: "#333",
        fontSize: "9px",
        textAlign: "center",
        borderTop: "1px solid #1a1a1a",
      }}>
        Powered by SomaFM • Free internet radio
      </div>
    </div>
  );
}

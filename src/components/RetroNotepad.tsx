"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RetroNotepadProps {
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
}

interface SavedNote {
  key: string;
  name: string;
  content: string;
  savedAt: string;
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const CURRENT_KEY = "calmatic-notepad-current";

function getSavedNotes(): SavedNote[] {
  try {
    const notes: SavedNote[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("calmatic-notepad-") && key !== CURRENT_KEY) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as SavedNote;
            notes.push(parsed);
          } catch {
            // skip malformed entries
          }
        }
      }
    }
    return notes.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch {
    return [];
  }
}

function getLineCol(text: string, caretPos: number): { line: number; col: number } {
  const before = text.slice(0, caretPos);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

// ── Inline style constants ────────────────────────────────────────────────────

const WIN95_BG = "#c0c0c0";
const TITLE_BG = "#000080";
const TITLE_TEXT = "#ffffff";
const BORDER_LIGHT = "#ffffff";
const BORDER_DARK = "#808080";
const BORDER_DARKEST = "#000000";

const windowStyle: React.CSSProperties = {
  position: "fixed",
  width: "500px",
  display: "flex",
  flexDirection: "column",
  background: WIN95_BG,
  border: `2px outset ${WIN95_BG}`,
  boxShadow: `2px 2px 0 ${BORDER_DARKEST}`,
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  fontSize: "13px",
  userSelect: "none",
};

const titleBarStyle: React.CSSProperties = {
  background: TITLE_BG,
  color: TITLE_TEXT,
  padding: "3px 6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "move",
  fontSize: "12px",
  fontWeight: "bold",
  gap: "6px",
  flexShrink: 0,
};

const titleIconStyle: React.CSSProperties = {
  width: "14px",
  height: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const titleBtnGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: "2px",
};

const titleBtnStyle: React.CSSProperties = {
  width: "16px",
  height: "14px",
  background: WIN95_BG,
  border: `1px outset ${WIN95_BG}`,
  cursor: "pointer",
  fontSize: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  color: "#000",
  fontWeight: "bold",
  lineHeight: 1,
};

const menuBarStyle: React.CSSProperties = {
  display: "flex",
  gap: "0",
  padding: "2px 4px",
  borderBottom: `1px solid ${BORDER_DARK}`,
  background: WIN95_BG,
  flexShrink: 0,
};

const statusBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "2px 8px",
  fontSize: "11px",
  borderTop: `2px inset ${WIN95_BG}`,
  background: WIN95_BG,
  flexShrink: 0,
  minHeight: "20px",
};

const statusSectionStyle: React.CSSProperties = {
  border: `1px inset ${WIN95_BG}`,
  padding: "0 6px",
  lineHeight: "16px",
};

// ── Dropdown menu ─────────────────────────────────────────────────────────────

interface MenuItemDef {
  label?: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  separator?: boolean;
}

function DropdownMenu({
  items,
  onClose,
}: {
  items: MenuItemDef[];
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        background: WIN95_BG,
        border: `2px outset ${WIN95_BG}`,
        boxShadow: `2px 2px 0 ${BORDER_DARKEST}`,
        minWidth: "180px",
        zIndex: 99999,
        padding: "2px 0",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div
            key={i}
            style={{
              margin: "3px 4px",
              borderTop: `1px solid ${BORDER_DARK}`,
              borderBottom: `1px solid ${BORDER_LIGHT}`,
            }}
          />
        ) : (
          <div
            key={i}
            style={{
              padding: "3px 20px 3px 24px",
              cursor: item.disabled ? "default" : "pointer",
              color: item.disabled ? "#808080" : "#000",
              display: "flex",
              justifyContent: "space-between",
              gap: "24px",
              fontSize: "13px",
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                (e.currentTarget as HTMLDivElement).style.background = "#000080";
                (e.currentTarget as HTMLDivElement).style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "transparent";
              (e.currentTarget as HTMLDivElement).style.color = item.disabled ? "#808080" : "#000";
            }}
            onClick={() => {
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span style={{ color: "inherit", opacity: 0.7 }}>{item.shortcut}</span>
            )}
          </div>
        )
      )}
    </div>
  );
}

// ── Open dialog (list of saved notes) ────────────────────────────────────────

function OpenDialog({
  notes,
  onOpen,
  onCancel,
}: {
  notes: SavedNote[];
  onOpen: (note: SavedNote) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(notes[0]?.key ?? null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        background: "rgba(0,0,0,0.3)",
      }}
      onMouseDown={onCancel}
    >
      <div
        style={{
          background: WIN95_BG,
          border: `2px outset ${WIN95_BG}`,
          boxShadow: `2px 2px 0 ${BORDER_DARKEST}`,
          width: "340px",
          fontFamily: "'Segoe UI', Tahoma, sans-serif",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* title bar */}
        <div style={{ ...titleBarStyle, cursor: "default" }}>
          <span>Open</span>
        </div>

        <div style={{ padding: "12px" }}>
          <div style={{ marginBottom: "6px", fontSize: "13px" }}>Saved notes:</div>

          {notes.length === 0 ? (
            <div
              style={{
                border: `2px inset ${WIN95_BG}`,
                background: "#fff",
                height: "120px",
                padding: "8px",
                fontSize: "13px",
                color: "#808080",
              }}
            >
              No saved notes.
            </div>
          ) : (
            <div
              style={{
                border: `2px inset ${WIN95_BG}`,
                background: "#fff",
                height: "120px",
                overflowY: "auto",
              }}
            >
              {notes.map((note) => (
                <div
                  key={note.key}
                  style={{
                    padding: "3px 8px",
                    cursor: "pointer",
                    background: selected === note.key ? "#000080" : "transparent",
                    color: selected === note.key ? "#fff" : "#000",
                    fontSize: "13px",
                  }}
                  onClick={() => setSelected(note.key)}
                  onDoubleClick={() => onOpen(note)}
                >
                  {note.name}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
            <button
              style={{
                ...titleBtnStyle,
                width: "72px",
                height: "24px",
                fontSize: "12px",
                border: `2px outset ${WIN95_BG}`,
              }}
              disabled={!selected}
              onClick={() => {
                const note = notes.find((n) => n.key === selected);
                if (note) onOpen(note);
              }}
            >
              Open
            </button>
            <button
              style={{
                ...titleBtnStyle,
                width: "72px",
                height: "24px",
                fontSize: "12px",
                border: `2px outset ${WIN95_BG}`,
              }}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RetroNotepad({ onClose, onFocus, zIndex }: RetroNotepadProps) {
  const { pos, onMouseDown: onTitleMouseDown } = useDrag(160, 80);

  const [text, setText] = useState("");
  const [title, setTitle] = useState("Untitled");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [caretPos, setCaretPos] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load auto-saved content on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { text: string; title: string; key: string | null };
        setText(parsed.text ?? "");
        setTitle(parsed.title ?? "Untitled");
        setSavedKey(parsed.key ?? null);
      }
    } catch {
      // nothing saved yet
    }
  }, []);

  // Auto-save to localStorage on every text change
  useEffect(() => {
    try {
      localStorage.setItem(
        CURRENT_KEY,
        JSON.stringify({ text, title, key: savedKey })
      );
    } catch {
      // localStorage unavailable
    }
  }, [text, title, savedKey]);

  const { line, col } = getLineCol(text, caretPos);
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // ── File operations ──────────────────────────────────────────────────────

  function handleNew() {
    if (dirty || text.length > 0) {
      const save = window.confirm("Do you want to save changes to " + title + "?");
      if (save) {
        handleSave();
      }
    }
    setText("");
    setTitle("Untitled");
    setSavedKey(null);
    setDirty(false);
  }

  function handleSave() {
    const name = savedKey ? title : window.prompt("Save as:", title) ?? title;
    if (!name.trim()) return;

    const key = savedKey ?? `calmatic-notepad-${Date.now()}`;
    const note: SavedNote = {
      key,
      name: name.trim(),
      content: text,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(key, JSON.stringify(note));
    } catch {
      // storage full
    }
    setSavedKey(key);
    setTitle(name.trim());
    setDirty(false);
  }

  function handleOpen() {
    const notes = getSavedNotes();
    setSavedNotes(notes);
    setShowOpenDialog(true);
  }

  function handleOpenNote(note: SavedNote) {
    if (dirty || text.length > 0) {
      const save = window.confirm("Do you want to save changes to " + title + "?");
      if (save) handleSave();
    }
    setText(note.content);
    setTitle(note.name);
    setSavedKey(note.key);
    setDirty(false);
    setShowOpenDialog(false);
  }

  // ── Menu definitions ─────────────────────────────────────────────────────

  const fileMenuItems: MenuItemDef[] = [
    { label: "New", shortcut: "Ctrl+N", action: handleNew },
    { label: "Open...", shortcut: "Ctrl+O", action: handleOpen },
    { separator: true },
    { label: "Save", shortcut: "Ctrl+S", action: handleSave },
    { label: "Save As...", action: () => { setSavedKey(null); handleSave(); } },
    { separator: true },
    { label: "Exit", action: onClose },
  ];

  const editMenuItems: MenuItemDef[] = [
    { label: "Undo", shortcut: "Ctrl+Z", disabled: true },
    { separator: true },
    { label: "Cut", shortcut: "Ctrl+X", disabled: true },
    { label: "Copy", shortcut: "Ctrl+C", disabled: true },
    { label: "Paste", shortcut: "Ctrl+V", disabled: true },
    { label: "Delete", shortcut: "Del", disabled: true },
    { separator: true },
    { label: "Select All", shortcut: "Ctrl+A", action: () => textareaRef.current?.select() },
    { separator: true },
    { label: "Time/Date", shortcut: "F5", action: () => {
      const now = new Date().toLocaleString();
      const ta = textareaRef.current;
      if (!ta) return;
      const s = ta.selectionStart;
      const e = ta.selectionEnd;
      const newText = text.slice(0, s) + now + text.slice(e);
      setText(newText);
      setDirty(true);
    }},
  ];

  const formatMenuItems: MenuItemDef[] = [
    {
      label: (wordWrap ? "✓ " : "    ") + "Word Wrap",
      action: () => setWordWrap((v) => !v),
    },
    { separator: true },
    { label: "Font...", disabled: true },
  ];

  const viewMenuItems: MenuItemDef[] = [
    { label: "Status Bar", disabled: true },
  ];

  const helpMenuItems: MenuItemDef[] = [
    { label: "About Notepad", action: () => alert("Notepad\nCalmatic Suite Retro Desktop\nWindows 95 edition") },
  ];

  const menus: { label: string; items: MenuItemDef[] }[] = [
    { label: "File", items: fileMenuItems },
    { label: "Edit", items: editMenuItems },
    { label: "Format", items: formatMenuItems },
    { label: "View", items: viewMenuItems },
    { label: "Help", items: helpMenuItems },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!textareaRef.current) return;
      if (document.activeElement !== textareaRef.current) return;
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      } else if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        handleNew();
      } else if (e.ctrlKey && e.key === "o") {
        e.preventDefault();
        handleOpen();
      } else if (e.key === "F5") {
        e.preventDefault();
        const now = new Date().toLocaleString();
        const ta = textareaRef.current;
        const s = ta.selectionStart;
        const en = ta.selectionEnd;
        const newText = text.slice(0, s) + now + text.slice(en);
        setText(newText);
        setDirty(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const windowTitle = `${title}${dirty ? " *" : ""} - Notepad`;

  return (
    <>
      <div
        style={{ ...windowStyle, left: pos.x, top: pos.y, zIndex }}
        onMouseDown={onFocus}
        onClick={() => setOpenMenu(null)}
      >
        {/* Title bar */}
        <div style={titleBarStyle} onMouseDown={onTitleMouseDown}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Notepad mini icon */}
            <div style={titleIconStyle}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="10" height="12" fill="#fff" stroke="#c0c0c0" strokeWidth="0.5" />
                <rect x="3" y="0" width="6" height="3" fill="#c0c0c0" stroke="#808080" strokeWidth="0.5" />
                <line x1="3" y1="5" x2="9" y2="5" stroke="#000080" strokeWidth="1" />
                <line x1="3" y1="7" x2="9" y2="7" stroke="#000080" strokeWidth="1" />
                <line x1="3" y1="9" x2="7" y2="9" stroke="#000080" strokeWidth="1" />
              </svg>
            </div>
            <span>{windowTitle}</span>
          </div>

          <div style={titleBtnGroupStyle}>
            {/* Minimize (decorative) */}
            <button
              style={titleBtnStyle}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              title="Minimize"
            >
              _
            </button>
            {/* Maximize (decorative) */}
            <button
              style={titleBtnStyle}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              title="Maximize"
            >
              □
            </button>
            {/* Close */}
            <button
              style={{ ...titleBtnStyle, fontWeight: "bold" }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Menu bar */}
        <div style={menuBarStyle} onMouseDown={(e) => e.stopPropagation()}>
          {menus.map((menu) => (
            <div
              key={menu.label}
              style={{ position: "relative" }}
            >
              <div
                style={{
                  padding: "2px 8px",
                  cursor: "pointer",
                  background: openMenu === menu.label ? "#000080" : "transparent",
                  color: openMenu === menu.label ? "#fff" : "#000",
                  fontSize: "13px",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  if (openMenu && openMenu !== menu.label) {
                    setOpenMenu(menu.label);
                  }
                  if (!openMenu) {
                    (e.currentTarget as HTMLDivElement).style.background = "#000080";
                    (e.currentTarget as HTMLDivElement).style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (openMenu !== menu.label) {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    (e.currentTarget as HTMLDivElement).style.color = "#000";
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(openMenu === menu.label ? null : menu.label);
                }}
              >
                {menu.label}
              </div>

              {openMenu === menu.label && (
                <DropdownMenu
                  items={menu.items}
                  onClose={() => setOpenMenu(null)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDirty(true);
          }}
          onSelect={(e) => {
            setCaretPos((e.target as HTMLTextAreaElement).selectionStart);
          }}
          onClick={() => {
            setOpenMenu(null);
            if (textareaRef.current) {
              setCaretPos(textareaRef.current.selectionStart);
            }
          }}
          onKeyUp={() => {
            if (textareaRef.current) {
              setCaretPos(textareaRef.current.selectionStart);
            }
          }}
          style={{
            flex: 1,
            width: "100%",
            minHeight: "320px",
            resize: "none",
            border: `2px inset ${WIN95_BG}`,
            background: "#ffffff",
            color: "#000000",
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "13px",
            lineHeight: "1.4",
            padding: "4px 6px",
            outline: "none",
            boxSizing: "border-box",
            whiteSpace: wordWrap ? "pre-wrap" : "pre",
            overflowWrap: wordWrap ? "break-word" : "normal",
            overflowX: wordWrap ? "hidden" : "auto",
            overflowY: "auto",
          }}
          spellCheck={false}
        />

        {/* Status bar */}
        <div style={statusBarStyle}>
          <span style={statusSectionStyle}>
            Ln {line}, Col {col}
          </span>
          <span style={statusSectionStyle}>
            {charCount} chars | {wordCount} words
          </span>
          <span style={statusSectionStyle}>
            {wordWrap ? "Wrap" : "No Wrap"}
          </span>
        </div>
      </div>

      {/* Resize grip (visual only) */}
      <div
        style={{
          position: "fixed",
          left: pos.x + 498,
          top: pos.y + 366,
          width: "12px",
          height: "12px",
          zIndex: zIndex + 1,
          cursor: "se-resize",
          background: `repeating-linear-gradient(
            -45deg,
            ${BORDER_DARK} 0px,
            ${BORDER_DARK} 1px,
            transparent 1px,
            transparent 3px
          )`,
          pointerEvents: "none",
        }}
      />

      {/* Open dialog */}
      {showOpenDialog && (
        <OpenDialog
          notes={savedNotes}
          onOpen={handleOpenNote}
          onCancel={() => setShowOpenDialog(false)}
        />
      )}
    </>
  );
}

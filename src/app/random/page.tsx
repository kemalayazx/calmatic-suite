"use client";

import { useState, useCallback } from "react";
import { generateNumbers, shuffleList, pickRandom, flipCoin, rollDice, type CoinSide } from "@/lib/calculations/random";

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "0.6rem 1.25rem", borderRadius: "0.5rem", fontWeight: 600, fontSize: "0.9rem",
      background: active ? "#7c3aed" : "transparent",
      color: active ? "#fff" : "#71717a",
      border: active ? "none" : "1px solid #3f3f46",
      cursor: "pointer",
    }}>{children}</button>
  );
}

// Tab 1: Number Generator
function NumberTab() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(5);
  const [allowDups, setAllowDups] = useState(true);
  const [intOnly, setIntOnly] = useState(true);
  const [decimals, setDecimals] = useState(2);
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    setError("");
    try {
      setResults(generateNumbers({ min, max, count, allowDuplicates: allowDups, integerOnly: intOnly, decimals }));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [min, max, count, allowDups, intOnly, decimals]);

  const copyAll = () => {
    navigator.clipboard.writeText(results.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        {[["Min", min, setMin], ["Max", max, setMax], ["Count", count, setCount]].map(([label, val, setter]) => (
          <div key={label as string}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.25rem" }}>{label as string}</label>
            <input type="number" value={val as number} onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))}
              style={{ width: "100%", background: "#27272a", border: "1px solid #3f3f46", borderRadius: "0.375rem", color: "#fafafa", padding: "0.5rem 0.75rem", fontSize: "0.9rem", outline: "none" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#d4d4d8", fontSize: "0.875rem" }}>
          <input type="checkbox" checked={allowDups} onChange={(e) => setAllowDups(e.target.checked)} style={{ accentColor: "#7c3aed" }} />
          Allow Duplicates
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#d4d4d8", fontSize: "0.875rem" }}>
          <input type="checkbox" checked={intOnly} onChange={(e) => setIntOnly(e.target.checked)} style={{ accentColor: "#7c3aed" }} />
          Integer Only
        </label>
        {!intOnly && (
          <div>
            <label style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>Decimals</label>
            <input type="number" value={decimals} min={1} max={10} onChange={(e) => setDecimals(Number(e.target.value))}
              style={{ width: "60px", marginLeft: "0.5rem", background: "#27272a", border: "1px solid #3f3f46", borderRadius: "0.375rem", color: "#fafafa", padding: "0.25rem 0.5rem", fontSize: "0.875rem", outline: "none" }} />
          </div>
        )}
      </div>
      {error && <div style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "0.75rem" }}>{error}</div>}
      <button onClick={generate}
        style={{ padding: "0.75rem 2rem", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 700, fontSize: "1rem", width: "100%", marginBottom: "1rem" }}>
        Generate
      </button>
      {results.length > 0 && (
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
            {results.map((n, i) => (
              <div key={i} style={{ background: "#27272a", borderRadius: "0.5rem", padding: "0.75rem 1.25rem", fontFamily: "monospace", fontSize: "1.25rem", fontWeight: 700, color: "#a78bfa" }}>
                {n}
              </div>
            ))}
          </div>
          <button onClick={copyAll}
            style={{ padding: "0.5rem 1.25rem", background: copied ? "#16a34a" : "#27272a", color: "#d4d4d8", border: "1px solid #3f3f46", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
            {copied ? "Copied!" : "Copy All"}
          </button>
        </div>
      )}
    </div>
  );
}

// Tab 2: List Randomizer
function ListTab() {
  const [text, setText] = useState("Apple\nBanana\nCherry\nDate\nEldberry");
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [pickN, setPickN] = useState(3);

  const items = text.split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.4rem" }}>
          Items (one per line)
        </label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
          style={{ width: "100%", background: "#27272a", border: "1px solid #3f3f46", borderRadius: "0.5rem", color: "#fafafa", padding: "0.75rem", fontSize: "0.9rem", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        <div style={{ fontSize: "0.75rem", color: "#52525b", marginTop: "0.25rem" }}>{items.length} items</div>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button onClick={() => { setShuffled(shuffleList(items)); setPicked([]); }}
          style={{ flex: 1, padding: "0.625rem 1rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 600 }}>
          Shuffle
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>Pick</span>
          <input type="number" value={pickN} min={1} max={items.length} onChange={(e) => setPickN(Number(e.target.value))}
            style={{ width: "60px", background: "#27272a", border: "1px solid #3f3f46", borderRadius: "0.375rem", color: "#fafafa", padding: "0.5rem", fontSize: "0.875rem", outline: "none" }} />
          <button onClick={() => { setPicked(pickRandom(items, pickN)); setShuffled([]); }}
            style={{ padding: "0.625rem 1rem", background: "#059669", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 600 }}>
            Random
          </button>
        </div>
      </div>
      {(shuffled.length > 0 || picked.length > 0) && (
        <div style={{ background: "#1c1c1f", borderRadius: "0.5rem", padding: "1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.5rem", textTransform: "uppercase" }}>
            {shuffled.length > 0 ? "Shuffled Order" : `${picked.length} Selected`}
          </div>
          {(shuffled.length > 0 ? shuffled : picked).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.4rem 0", borderBottom: "1px solid #27272a" }}>
              <span style={{ color: "#52525b", minWidth: "1.5rem", fontSize: "0.8rem" }}>{i + 1}.</span>
              <span style={{ color: "#fafafa" }}>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Tab 3: Coin / Dice
function CoinDiceTab() {
  const [coinResult, setCoinResult] = useState<CoinSide | null>(null);
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [coinHistory, setCoinHistory] = useState<CoinSide[]>([]);
  const [diceCount, setDiceCount] = useState(2);
  const [diceResult, setDiceResult] = useState<{ dice: number[]; total: number } | null>(null);
  const [diceHistory, setDiceHistory] = useState<number[]>([]);

  const doFlip = () => {
    setCoinFlipping(true);
    setTimeout(() => {
      const r = flipCoin();
      setCoinResult(r);
      setCoinFlipping(false);
      setCoinHistory((prev) => [...prev.slice(-49), r]);
    }, 400);
  };

  const doRoll = () => {
    const r = rollDice(diceCount);
    setDiceResult(r);
    setDiceHistory((prev) => [...prev.slice(-49), r.total]);
  };

  const headsCount = coinHistory.filter((c) => c === "Heads").length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
      {/* Coin */}
      <div>
        <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1rem" }}>Coin Flip</h3>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div style={{
            width: "100px", height: "100px", borderRadius: "50%", margin: "0 auto 1rem",
            background: coinFlipping
              ? "conic-gradient(#7c3aed, #a78bfa, #7c3aed)"
              : coinResult === "Heads" ? "linear-gradient(135deg, #eab308, #f59e0b)"
              : coinResult === "Tails" ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
              : "#27272a",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.875rem", fontWeight: 800, color: "#fff",
            animation: coinFlipping ? "spin 0.4s linear" : "none",
            transition: "background 0.2s",
          }}>
            {coinFlipping ? "..." : coinResult ?? "?"}
          </div>
          <button onClick={doFlip}
            style={{ padding: "0.625rem 2rem", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
            Flip
          </button>
        </div>
        {coinHistory.length > 0 && (
          <div style={{ background: "#1c1c1f", borderRadius: "0.5rem", padding: "0.75rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.4rem" }}>Last {coinHistory.length} flips</div>
            <div style={{ display: "flex", gap: "0.2rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {coinHistory.map((c, i) => (
                <span key={i} style={{ width: "20px", height: "20px", borderRadius: "50%", background: c === "Heads" ? "#eab308" : "#6366f1", display: "inline-block", fontSize: "0.55rem", lineHeight: "20px", textAlign: "center", color: "#fff", fontWeight: 700 }}>
                  {c[0]}
                </span>
              ))}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>
              H: {headsCount} ({coinHistory.length > 0 ? ((headsCount / coinHistory.length) * 100).toFixed(0) : 0}%) ·
              T: {coinHistory.length - headsCount} ({coinHistory.length > 0 ? (((coinHistory.length - headsCount) / coinHistory.length) * 100).toFixed(0) : 0}%)
            </div>
          </div>
        )}
      </div>

      {/* Dice */}
      <div>
        <h3 style={{ color: "#fafafa", fontWeight: 700, marginBottom: "1rem" }}>Dice Roll</h3>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#a1a1aa", marginBottom: "0.3rem" }}>Number of dice (d6)</label>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button key={n} onClick={() => setDiceCount(n)}
                style={{ width: "36px", height: "36px", borderRadius: "0.375rem", background: diceCount === n ? "#7c3aed" : "#27272a", color: diceCount === n ? "#fff" : "#a1a1aa", border: "none", cursor: "pointer", fontWeight: 700 }}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <button onClick={doRoll}
          style={{ padding: "0.625rem 2rem", background: "#059669", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 700, fontSize: "1rem", marginBottom: "1rem" }}>
          Roll
        </button>
        {diceResult && (
          <div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              {diceResult.dice.map((d, i) => (
                <div key={i} style={{
                  width: "48px", height: "48px", background: "#27272a", borderRadius: "0.5rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", fontWeight: 800, color: "#a78bfa", border: "1px solid #3f3f46",
                }}>{d}</div>
              ))}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#71717a" }}>
              Total: <strong style={{ color: "#f97316", fontSize: "1.25rem" }}>{diceResult.total}</strong>
            </div>
          </div>
        )}
        {diceHistory.length > 0 && (
          <div style={{ background: "#1c1c1f", borderRadius: "0.5rem", padding: "0.75rem", marginTop: "0.75rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: "0.4rem" }}>Last {diceHistory.length} totals</div>
            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {diceHistory.map((t, i) => (
                <span key={i} style={{ padding: "0.1rem 0.4rem", background: "#27272a", borderRadius: "0.25rem", fontSize: "0.75rem", color: "#a1a1aa" }}>{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RandomPage() {
  const [tab, setTab] = useState<"number" | "list" | "coin">("number");

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", color: "#fafafa" }}>
        Random Generator
      </h1>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>
        Cryptographically secure randomness via <code style={{ color: "#a78bfa" }}>crypto.getRandomValues</code>.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <TabButton active={tab === "number"} onClick={() => setTab("number")}>Number Generator</TabButton>
        <TabButton active={tab === "list"} onClick={() => setTab("list")}>List Randomizer</TabButton>
        <TabButton active={tab === "coin"} onClick={() => setTab("coin")}>Coin / Dice</TabButton>
      </div>

      <div style={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "0.75rem", padding: "1.5rem" }}>
        {tab === "number" && <NumberTab />}
        {tab === "list" && <ListTab />}
        {tab === "coin" && <CoinDiceTab />}
      </div>

      <p style={{ color: "#52525b", fontSize: "0.8rem", textAlign: "center", marginTop: "1.5rem" }}>
        All random values are generated locally in your browser. No data is collected or transmitted.
      </p>
    </div>
  );
}

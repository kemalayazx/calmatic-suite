"use client";

import { useState } from "react";
import {
  calculateFuelCost,
  calculateTripSplit,
  mpgToL100km,
  l100kmToMpg,
  type DistanceUnit,
  type FuelUnit,
  type PriceUnit,
} from "@/lib/calculations/fuel";
import { useLanguage } from "@/context/LanguageContext";

export default function FuelPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [t("fuel.tab.cost"), t("fuel.tab.splitter"), t("fuel.tab.converter")];

  // Shared
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("miles");
  const [fuelEffUnit, setFuelEffUnit] = useState<FuelUnit>("mpg");
  const [gasPriceUnit, setGasPriceUnit] = useState<PriceUnit>("per_gallon");

  // Tab 1 & 2
  const [distance, setDistance] = useState("300");
  const [fuelEfficiency, setFuelEfficiency] = useState("30");
  const [gasPrice, setGasPrice] = useState("3.50");
  const [passengers, setPassengers] = useState("3");

  // Tab 3
  const [mpgInput, setMpgInput] = useState("30");
  const [lInput, setLInput] = useState("7.8");

  const costResult = calculateFuelCost(
    parseFloat(distance) || 0,
    distanceUnit,
    parseFloat(fuelEfficiency) || 0,
    fuelEffUnit,
    parseFloat(gasPrice) || 0,
    gasPriceUnit
  );

  const splitResult = calculateTripSplit(
    parseFloat(distance) || 0,
    distanceUnit,
    parseFloat(fuelEfficiency) || 0,
    fuelEffUnit,
    parseFloat(gasPrice) || 0,
    gasPriceUnit,
    parseInt(passengers) || 1
  );

  const mpgConverted = mpgToL100km(parseFloat(mpgInput) || 0);
  const lConverted = l100kmToMpg(parseFloat(lInput) || 0);

  const priceLabel = gasPriceUnit === "per_gallon" ? "$/gal" : "$/L";
  const effLabel = fuelEffUnit === "mpg" ? "MPG" : "L/100km";
  const distLabel = distanceUnit === "miles" ? t("fuel.unit.miles") : "km";

  const ToggleBtn = ({ value, current, set, label }: { value: string; current: string; set: (v: string) => void; label: string }) => (
    <button onClick={() => set(value)}
      style={{ padding: "0.3rem 0.6rem", borderRadius: "0.375rem", border: "none", fontSize: "0.75rem", cursor: "pointer", background: current === value ? "#7c3aed" : "#27272a", color: current === value ? "white" : "#a1a1aa", fontWeight: current === value ? 700 : 400 }}>
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>{t("fuel.title")}</h1>
      <p style={{ color: "#71717a", marginBottom: "2rem" }}>{t("fuel.subtitle")}</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid #27272a" }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            style={{ padding: "0.625rem 1.25rem", border: "none", background: "transparent", color: activeTab === i ? "#a78bfa" : "#71717a", fontWeight: activeTab === i ? 700 : 400, cursor: "pointer", fontSize: "0.9rem", borderBottom: activeTab === i ? "2px solid #7c3aed" : "2px solid transparent" }}>
            {tab}
          </button>
        ))}
      </div>

      {(activeTab === 0 || activeTab === 1) && (
        <>
          {/* Unit toggles */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#71717a" }}>{t("fuel.label.distance")}:</span>
            <ToggleBtn value="miles" current={distanceUnit} set={(v) => setDistanceUnit(v as DistanceUnit)} label={t("fuel.unit.miles")} />
            <ToggleBtn value="km" current={distanceUnit} set={(v) => setDistanceUnit(v as DistanceUnit)} label="km" />
            <span style={{ fontSize: "0.8rem", color: "#71717a", marginLeft: "0.5rem" }}>{t("fuel.label.efficiency")}:</span>
            <ToggleBtn value="mpg" current={fuelEffUnit} set={(v) => setFuelEffUnit(v as FuelUnit)} label="MPG" />
            <ToggleBtn value="L100km" current={fuelEffUnit} set={(v) => setFuelEffUnit(v as FuelUnit)} label="L/100km" />
            <span style={{ fontSize: "0.8rem", color: "#71717a", marginLeft: "0.5rem" }}>{t("fuel.label.price")}:</span>
            <ToggleBtn value="per_gallon" current={gasPriceUnit} set={(v) => setGasPriceUnit(v as PriceUnit)} label="$/gal" />
            <ToggleBtn value="per_liter" current={gasPriceUnit} set={(v) => setGasPriceUnit(v as PriceUnit)} label="$/L" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: activeTab === 1 ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("fuel.label.distance")} ({distLabel})</label>
              <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("fuel.label.efficiency")} ({effLabel})</label>
              <input type="number" value={fuelEfficiency} onChange={(e) => setFuelEfficiency(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("fuel.label.gasPrice")} ({priceLabel})</label>
              <input type="number" value={gasPrice} onChange={(e) => setGasPrice(e.target.value)} step="0.01"
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
            </div>
            {activeTab === 1 && (
              <div>
                <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("fuel.label.passengers")}</label>
                <input type="number" value={passengers} onChange={(e) => setPassengers(e.target.value)} min="1"
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#18181b", color: "#fafafa", fontSize: "0.9rem" }} />
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab 1 — Fuel Cost */}
      {activeTab === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[
            { label: t("fuel.result.fuelNeeded"), value: `${costResult.fuelNeeded.toFixed(2)} ${costResult.fuelUnit}`, color: "#a78bfa" },
            { label: t("fuel.result.totalCost"), value: `$${costResult.totalCost.toFixed(2)}`, color: "#22c55e" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.5rem" }}>{label}</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2 — Trip Splitter */}
      {activeTab === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          {[
            { label: t("fuel.result.fuelNeeded"), value: `${splitResult.fuelNeeded.toFixed(2)} ${splitResult.fuelUnit}`, color: "#a78bfa" },
            { label: t("fuel.result.totalFuelCost"), value: `$${splitResult.totalCost.toFixed(2)}`, color: "#fbbf24" },
            { label: `${t("fuel.result.costPerPerson")} (÷${passengers})`, value: `$${splitResult.costPerPerson.toFixed(2)}`, color: "#22c55e" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "0.5rem" }}>{label}</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3 — Converter */}
      {activeTab === 2 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "1.25rem" }}>{t("fuel.conv.mpgToL")}</div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("fuel.label.milesPerGallon")}</label>
              <input type="number" value={mpgInput} onChange={(e) => setMpgInput(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }} />
            </div>
            <div style={{ padding: "0.875rem", background: "#09090b", borderRadius: "0.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#22c55e" }}>{mpgConverted.toFixed(2)}</div>
              <div style={{ fontSize: "0.85rem", color: "#71717a" }}>L/100km</div>
            </div>
          </div>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "1.25rem" }}>{t("fuel.conv.lToMpg")}</div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#a1a1aa", fontSize: "0.8rem", marginBottom: "0.3rem" }}>{t("fuel.label.litersPerKm")}</label>
              <input type="number" value={lInput} onChange={(e) => setLInput(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", background: "#09090b", color: "#fafafa", fontSize: "0.95rem" }} />
            </div>
            <div style={{ padding: "0.875rem", background: "#09090b", borderRadius: "0.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#22c55e" }}>{lConverted.toFixed(2)}</div>
              <div style={{ fontSize: "0.85rem", color: "#71717a" }}>MPG</div>
            </div>
          </div>
        </div>
      )}

      <p style={{ marginTop: "3rem", fontSize: "0.8rem", color: "#52525b", borderTop: "1px solid #27272a", paddingTop: "1rem" }}>
        {t("common.disclaimerProfessional")}
      </p>
    </div>
  );
}

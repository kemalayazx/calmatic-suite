export type DistanceUnit = "km" | "mi";
export type SpeedUnit = "km/h" | "mph" | "m/s" | "knots";
export type TimeUnit = "hours" | "minutes" | "seconds";

// Conversion to SI (meters, seconds)
const toMeters: Record<DistanceUnit, number> = { km: 1000, mi: 1609.344 };
const toMetersPerSecond: Record<SpeedUnit, number> = {
  "km/h": 1 / 3.6,
  mph: 0.44704,
  "m/s": 1,
  knots: 0.514444,
};
const toSeconds: Record<TimeUnit, number> = { hours: 3600, minutes: 60, seconds: 1 };

export interface SpeedCalcInputs {
  mode: "speed" | "distance" | "time";
  // for "speed": distance + time given
  // for "distance": speed + time given
  // for "time": speed + distance given
  value1: number;
  unit1: string;
  value2: number;
  unit2: string;
  // output unit preferences
  speedUnit: SpeedUnit;
  distanceUnit: DistanceUnit;
  timeUnit: TimeUnit;
}

export interface SpeedCalcResult {
  speed: number;
  distance: number;
  time: number; // in timeUnit
  speedDisplay: string;
  distanceDisplay: string;
  timeDisplay: string;
}

export function calcSpeed(inputs: SpeedCalcInputs): SpeedCalcResult {
  const { mode, value1, unit1, value2, unit2, speedUnit, distanceUnit, timeUnit } = inputs;

  let speedMs = 0, distanceM = 0, timeS = 0;

  if (mode === "speed") {
    // v1 = distance, v2 = time
    distanceM = value1 * (toMeters[unit1 as DistanceUnit] ?? 1000);
    timeS = value2 * (toSeconds[unit2 as TimeUnit] ?? 3600);
    speedMs = timeS > 0 ? distanceM / timeS : 0;
  } else if (mode === "distance") {
    speedMs = value1 * (toMetersPerSecond[unit1 as SpeedUnit] ?? (1 / 3.6));
    timeS = value2 * (toSeconds[unit2 as TimeUnit] ?? 3600);
    distanceM = speedMs * timeS;
  } else {
    speedMs = value1 * (toMetersPerSecond[unit1 as SpeedUnit] ?? (1 / 3.6));
    distanceM = value2 * (toMeters[unit2 as DistanceUnit] ?? 1000);
    timeS = speedMs > 0 ? distanceM / speedMs : 0;
  }

  const speed = speedMs / toMetersPerSecond[speedUnit];
  const distance = distanceM / toMeters[distanceUnit];
  const time = timeS / toSeconds[timeUnit];

  return {
    speed,
    distance,
    time,
    speedDisplay: `${speed.toFixed(2)} ${speedUnit}`,
    distanceDisplay: `${distance.toFixed(2)} ${distanceUnit}`,
    timeDisplay: formatTime(timeS, timeUnit),
  };
}

function formatTime(seconds: number, preferUnit: TimeUnit): string {
  if (preferUnit === "seconds") return `${seconds.toFixed(1)} seconds`;
  if (preferUnit === "minutes") return `${(seconds / 60).toFixed(1)} minutes`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// Pace calculator
export interface PaceResult {
  paceMinPerKm: number;
  paceMinPerMile: number;
  finishTime: { hours: number; minutes: number; seconds: number };
}

export function calcPace(opts: {
  inputType: "min/km" | "min/mi";
  value: number; // minutes
  raceDistanceKm: number;
}): PaceResult {
  const { inputType, value, raceDistanceKm } = opts;
  let minPerKm: number;
  if (inputType === "min/km") {
    minPerKm = value;
  } else {
    minPerKm = value / 1.60934;
  }
  const minPerMile = minPerKm * 1.60934;
  const totalMinutes = minPerKm * raceDistanceKm;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.round((totalMinutes * 60) % 60);
  return { paceMinPerKm: minPerKm, paceMinPerMile: minPerMile, finishTime: { hours, minutes, seconds } };
}

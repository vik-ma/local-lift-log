import { IsNumberValidAndAbove0 } from "..";

export const ConvertSpeedValue = (
  value: number,
  currentUnit: string,
  newUnit: string
) => {
  if (!IsNumberValidAndAbove0(value)) return 0;

  if (currentUnit === newUnit) return value;

  const conversionRates: Record<string, Record<string, number>> = {
    "km/h": { "km/h": 1, "m/s": 1 / 3.6, mph: 0.621371, fps: 0.911344 },
    "m/s": { "km/h": 3.6, "m/s": 1, mph: 2.23694, fps: 3.28084 },
    mph: { "km/h": 1.60934, "m/s": 1 / 2.23694, mph: 1, fps: 1.46667 },
    fps: { "km/h": 1.09728, "m/s": 1 / 3.28084, mph: 0.681818, fps: 1 },
  };

  if (
    !(currentUnit in conversionRates) ||
    !(newUnit in conversionRates[currentUnit])
  ) {
    return value;
  }

  return value * conversionRates[currentUnit][newUnit];
};

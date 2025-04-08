import { IsNumberValidAndAbove0 } from "..";

export const ConvertPaceValue = (
  value: number,
  currentUnit: string,
  newUnit: string
) => {
  if (!IsNumberValidAndAbove0(value)) return 0;

  if (currentUnit === newUnit) return value;

  const toSecondsPerMeter = (val: number, unit: string): number => {
    switch (unit) {
      case "min/km":
        return (val * 60) / 1000;
      case "s/m":
        return val;
      case "min/mi":
        return (val * 60) / 1609.34;
      case "s/yd":
        return val / 0.9144;
      default:
        return 0;
    }
  };

  const fromSecondsPerMeter = (val: number, unit: string): number => {
    switch (unit) {
      case "min/km":
        return (val * 1000) / 60;
      case "s/m":
        return val;
      case "min/mi":
        return (val * 1609.34) / 60;
      case "s/yd":
        return val * 0.9144;
      default:
        return 0;
    }
  };

  const secondsPerMeter = toSecondsPerMeter(value, currentUnit);
  
  return fromSecondsPerMeter(secondsPerMeter, newUnit);
};

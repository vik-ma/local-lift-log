import { IsNumberValidAndAbove0 } from "..";

export const ConvertWeightValue = (
  value: number,
  currentUnit: string,
  newUnit: string
) => {
  if (!IsNumberValidAndAbove0(value)) return 0;

  if (currentUnit === newUnit) return value;

  const kgToLbs = 2.20462;
  const lbsToKg = 1 / kgToLbs;

  if (currentUnit === "kg" && newUnit === "lbs") {
    return value * kgToLbs;
  } else if (currentUnit === "lbs" && newUnit === "kg") {
    return value * lbsToKg;
  } else {
    return value;
  }
};

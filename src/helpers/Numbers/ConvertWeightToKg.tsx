export const ConvertWeightToKg = (weight: number, unit: string): number => {
  if (unit === "lbs") {
    return weight / 2.20462;
  }
  return weight;
};

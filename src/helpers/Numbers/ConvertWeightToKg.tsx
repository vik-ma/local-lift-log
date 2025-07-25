export const ConvertWeightToKg = (weight: number, unit: string) => {
  if (unit === "lbs") {
    return weight / 2.20462;
  }
  return weight;
};

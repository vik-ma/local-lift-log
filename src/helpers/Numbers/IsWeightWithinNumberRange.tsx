import { NumberRange } from "../../typings";
import { ConvertWeightToKg } from "./ConvertWeightToKg";

export const IsWeightWithinNumberRange = (
  numberRange: NumberRange,
  weight: number,
  weightUnit: string,
  filterWeightUnit: string
) => {
  const weightInKg = ConvertWeightToKg(weight, weightUnit);
  const startWeight = ConvertWeightToKg(numberRange.start, filterWeightUnit);
  const endWeight = ConvertWeightToKg(numberRange.end, filterWeightUnit);

  return weightInKg >= startWeight && weightInKg <= endWeight;
};

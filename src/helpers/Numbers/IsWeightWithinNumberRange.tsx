import { NumberRange } from "../../typings";
import { ConvertWeightToKg } from "./ConvertWeightToKg";

export const IsWeightWithinNumberRange = (
  numberRange: NumberRange,
  weight: number,
  weightUnit: string,
  filterWeightRangeUnit: string
) => {
  const weightInKg = ConvertWeightToKg(weight, weightUnit);
  const startWeight = ConvertWeightToKg(
    numberRange.start,
    filterWeightRangeUnit
  );
  const endWeight = ConvertWeightToKg(numberRange.end, filterWeightRangeUnit);

  return weightInKg >= startWeight && weightInKg <= endWeight;
};

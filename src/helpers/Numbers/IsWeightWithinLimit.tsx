import { ConvertWeightToKg } from "./ConvertWeightToKg";

export const IsWeightWithinLimit = (
  weight: number,
  weightLimit: number | null,
  weightUnit: string,
  weightLimitUnit: string,
  isMaxLimit: boolean
) => {
  if (weightLimit === null) return true;

  const weightInKg = ConvertWeightToKg(weight, weightUnit);
  const weightLimitInKg = ConvertWeightToKg(weightLimit, weightLimitUnit);

  if (isMaxLimit) {
    return weightInKg <= weightLimitInKg;
  } else {
    return weightInKg >= weightLimitInKg;
  }
};

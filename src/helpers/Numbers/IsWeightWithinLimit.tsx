import { ConvertWeightToKg } from "./ConvertWeightToKg";

export const IsWeightWithinLimit = (
  weight: number,
  weightLimit: number | null,
  weightUnit: string,
  weightLimitUnit: string,
  isMaxLimit: boolean,
  include0Values?: boolean
) => {
  if (weightLimit === null) return true;

  if (weight === 0 && include0Values === false) return false;

  const weightInKg = ConvertWeightToKg(weight, weightUnit);
  const weightLimitInKg = ConvertWeightToKg(weightLimit, weightLimitUnit);

  if (isMaxLimit) {
    return weightInKg <= weightLimitInKg;
  } else {
    return weightInKg >= weightLimitInKg;
  }
};

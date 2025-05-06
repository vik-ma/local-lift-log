import { BodyFatCalculationConstants } from "../../typings";

export const GetBodyFatCalculationConstants = (
  isMale: boolean,
  ageGroup: string
) => {
  const maleConstants: Record<string, BodyFatCalculationConstants> = {
    "17-19": { c: 1.162, m: 0.063 },
    "20-29": { c: 1.1631, m: 0.0632 },
    "30-39": { c: 1.1422, m: 0.0544 },
    "40-49": { c: 1.162, m: 0.07 },
    "50+": { c: 1.1715, m: 0.0779 },
  };

  const femaleConstants: Record<string, BodyFatCalculationConstants> = {
    "17-19": { c: 1.1549, m: 0.0678 },
    "20-29": { c: 1.1599, m: 0.0717 },
    "30-39": { c: 1.1423, m: 0.0632 },
    "40-49": { c: 1.1333, m: 0.0612 },
    "50+": { c: 1.1339, m: 0.0645 },
  };

  const constants = isMale ? maleConstants : femaleConstants;

  return constants[ageGroup] || { c: 0, m: 0 };
};

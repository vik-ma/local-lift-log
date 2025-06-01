import { ValidWeightUnits } from "..";

export const GetValidatedWeightUnit = (weightUnit: string) => {
  if (ValidWeightUnits().includes(weightUnit)) return weightUnit;
  
  return ValidWeightUnits()[0];
};

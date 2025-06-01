export const GetValidatedWeightUnit = (weightUnit: string) => {
  if (weightUnit === "lbs") return "lbs";
  return "kg";
};

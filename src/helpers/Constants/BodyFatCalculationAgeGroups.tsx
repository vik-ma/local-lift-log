export const BodyFatCalculationAgeGroups = () => {
  const VALID_AGE_GROUPS = new Set(["17-19", "20-29", "30-39", "40-49", "50+"]);

  Object.freeze(VALID_AGE_GROUPS);

  return VALID_AGE_GROUPS;
};

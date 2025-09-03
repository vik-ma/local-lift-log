import { DIET_PHASE_TYPES } from "../../constants";

export const GetValidatedDietPhase = (dietPhase: string | null) => {
  if (dietPhase === null) return dietPhase;

  if (DIET_PHASE_TYPES.includes(dietPhase)) return dietPhase;

  return null;
};

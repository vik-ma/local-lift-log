import { DietPhaseTypes } from "..";

export const GetValidatedDietPhase = (dietPhase: string | null) => {
  if (dietPhase === null) return dietPhase;

  const validDietPhaseTypes = DietPhaseTypes();

  if (validDietPhaseTypes.includes(dietPhase)) return dietPhase;

  return null;
};

export const ValidTimeInputs = (): string[] => {
  const VALID_TIME_INPUTS: string[] = ["hhmmss", "mmss", "minutes", "seconds"];
  Object.freeze(VALID_TIME_INPUTS);
  return VALID_TIME_INPUTS;
};

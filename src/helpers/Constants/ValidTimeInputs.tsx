export const ValidTimeInputs = (): string[] => {
  const validTimeInputs: string[] = ["hhmmss", "mmss", "minutes", "seconds"];
  Object.freeze(validTimeInputs);
  return validTimeInputs;
};

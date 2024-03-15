export const ValidDistanceUnits = (): string[] => {
  const validDistanceUnits: string[] = ["km", "m", "mi", "ft", "yd"];
  Object.freeze(validDistanceUnits);
  return validDistanceUnits;
};

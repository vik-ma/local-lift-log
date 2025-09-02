export const ValidDistanceUnits = (): string[] => {
  const VALID_DISTANCE_UNITS: string[] = ["km", "m", "mi", "ft", "yd"];
  Object.freeze(VALID_DISTANCE_UNITS);
  return VALID_DISTANCE_UNITS;
};

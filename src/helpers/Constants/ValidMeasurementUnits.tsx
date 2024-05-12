export const ValidMeasurementUnits = (): string[] => {
  const validMeasurementUnits: string[] = ["cm", "mm", "in"];
  Object.freeze(validMeasurementUnits);
  return validMeasurementUnits;
};

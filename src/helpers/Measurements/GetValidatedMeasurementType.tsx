export const GetValidatedMeasurementType = (measurementType: string) => {
  if (measurementType === "Caliper" || measurementType === "Circumference")
    return measurementType;

  return "Circumference";
};

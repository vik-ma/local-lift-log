import { IsStringInvalidIntegerOr0 } from "..";

export const ValidateActiveMeasurementsString = (
  activeMeasurementsString: string
): boolean => {
  if (activeMeasurementsString === "") return true;

  const measurementIdStrings = activeMeasurementsString.split(",");

  for (const measurementId of measurementIdStrings) {
    if (IsStringInvalidIntegerOr0(measurementId)) return false;
  }

  return true;
};

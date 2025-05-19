import { IsStringInvalidInteger } from "..";

export const ValidateActiveMeasurementsString = (
  activeMeasurementsString: string
): boolean => {
  if (activeMeasurementsString === "") return true;

  const measurementIdStrings = activeMeasurementsString.split(",");

  for (const measurementId of measurementIdStrings) {
    if (IsStringInvalidInteger(measurementId, 0, true)) return false;
  }

  return true;
};

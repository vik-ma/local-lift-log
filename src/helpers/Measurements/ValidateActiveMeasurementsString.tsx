import { IsStringInvalidNumberOr0 } from "../Numbers/IsStringInvalidNumberOr0";

export const ValidateActiveMeasurementsString = (
  activeMeasurementsString: string
): boolean => {
  if (activeMeasurementsString === "") return true;

  const measurementIdStrings = activeMeasurementsString.split(",");

  for (const measurementId of measurementIdStrings) {
    if (IsStringInvalidNumberOr0(measurementId)) return false;
  }

  return true;
};

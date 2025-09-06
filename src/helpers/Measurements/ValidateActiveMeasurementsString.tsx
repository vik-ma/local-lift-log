import { IsStringInvalidInteger } from "..";

export const ValidateActiveMeasurementsString = (
  activeMeasurementsString: string
) => {
  if (activeMeasurementsString === "") return true;

  const measurementIdStrings = activeMeasurementsString.split(",");

  const minValue = 0;
  const doNotAllowMinValue = true;

  for (const measurementId of measurementIdStrings) {
    if (IsStringInvalidInteger(measurementId, minValue, doNotAllowMinValue))
      return false;
  }

  return true;
};

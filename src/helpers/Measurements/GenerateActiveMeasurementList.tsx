import { IsStringEmpty, IsStringInvalidInteger } from "..";

export const GenerateActiveMeasurementList = (
  activeTrackingMeasurementString: string
): number[] => {
  const activeMeasurementList: number[] = [];

  if (IsStringEmpty(activeTrackingMeasurementString))
    return activeMeasurementList;

  const activeMeasurementStringList: string[] =
    activeTrackingMeasurementString.split(",");

  const minValue = 0;
  const doNotAllowMinValue = true;

  activeMeasurementStringList.map((measurement) => {
    if (!IsStringInvalidInteger(measurement, minValue, doNotAllowMinValue)) {
      activeMeasurementList.push(Number(measurement));
    }
  });

  return activeMeasurementList;
};

import { IsStringEmpty, IsStringInvalidInteger } from "..";

export const GenerateActiveMeasurementList = (
  activeTrackingMeasurementString: string
): number[] => {
  const activeMeasurementList: number[] = [];

  if (IsStringEmpty(activeTrackingMeasurementString))
    return activeMeasurementList;

  const activeMeasurementStringList: string[] =
    activeTrackingMeasurementString.split(",");

  activeMeasurementStringList.map((measurement) => {
    if (!IsStringInvalidInteger(measurement, 0, true)) {
      activeMeasurementList.push(Number(measurement));
    }
  });

  return activeMeasurementList;
};

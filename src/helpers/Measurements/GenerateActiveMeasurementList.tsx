import { IsStringEmpty, IsStringInvalidNumber } from "..";

export const GenerateActiveMeasurementList = (
  activeTrackingMeasurementString: string
): number[] => {
  const activeMeasurementList: number[] = [];

  if (IsStringEmpty(activeTrackingMeasurementString))
    return activeMeasurementList;

  const activeMeasurementStringList: string[] =
    activeTrackingMeasurementString.split(",");

  activeMeasurementStringList.map((measurement) => {
    if (!IsStringInvalidNumber(measurement)) {
      activeMeasurementList.push(Number(measurement));
    }
  });

  return activeMeasurementList;
};

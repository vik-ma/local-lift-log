import { IsStringInvalidNumber } from "..";

export const GenerateActiveMeasurementList = (
  activeTrackingMeasurementString: string
): number[] => {
  const activeMeasurementStringList: string[] =
    activeTrackingMeasurementString.split(",");

  const activeMeasurementList: number[] = [];

  activeMeasurementStringList.map((measurement) => {
    if (!IsStringInvalidNumber(measurement)) {
      activeMeasurementList.push(Number(measurement));
    }
  });

  return activeMeasurementList;
};

import { IsStringInvalidNumber } from "../Numbers/IsStringInvalidNumber";

export const GenerateActiveMeasurementSet = (
  activeTrackingMeasurementString: string
): Set<number> => {
  const activeMeasurementStringList: string[] =
    activeTrackingMeasurementString.split(",");

  const activeMeasurementIdList: Set<number> = new Set<number>();

  activeMeasurementStringList.map((measurement) => {
    if (!IsStringInvalidNumber(measurement)) {
      activeMeasurementIdList.add(Number(measurement));
    }
  });

  return activeMeasurementIdList;
};

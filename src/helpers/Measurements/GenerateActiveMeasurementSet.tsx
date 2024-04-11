import { IsStringInvalidNumber } from "../Numbers/IsStringInvalidNumber";

export const GenerateActiveMeasurementSet = (
  activeTrackingMeasurementString: string
): Set<number> => {
  const activeMeasurementStringList: string[] =
    activeTrackingMeasurementString.split(",");

  const activeMeasurementSet: Set<number> = new Set<number>();

  activeMeasurementStringList.map((measurement) => {
    if (!IsStringInvalidNumber(measurement)) {
      activeMeasurementSet.add(Number(measurement));
    }
  });

  return activeMeasurementSet;
};

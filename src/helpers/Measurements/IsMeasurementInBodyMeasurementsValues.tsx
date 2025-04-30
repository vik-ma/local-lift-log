import { BodyMeasurementsValues } from "../../typings";

export const IsMeasurementInBodyMeasurementsValues = (
  bodyMeasurementsValues: BodyMeasurementsValues | undefined,
  filterMeasurements: Set<string>
) => {
  if (bodyMeasurementsValues === undefined) return false;

  for (const id of filterMeasurements) {
    if (id in bodyMeasurementsValues) return true;
  }

  return false;
};

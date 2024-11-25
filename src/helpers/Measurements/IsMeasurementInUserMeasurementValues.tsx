import { UserMeasurementValues } from "../../typings";

export const IsMeasurementInUserMeasurementValues = (
  userMeasurementValues: UserMeasurementValues | undefined,
  filterMeasurements: Set<string>
) => {
  if (userMeasurementValues === undefined) return false;

  for (const id of filterMeasurements) {
    if (id in userMeasurementValues) return true;
  }

  return false;
};

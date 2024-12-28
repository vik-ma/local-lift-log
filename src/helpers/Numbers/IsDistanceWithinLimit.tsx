import { ConvertDistanceToMeter } from "./ConvertDistanceToMeter";

export const IsDistanceWithinLimit = (
  distance: number,
  distanceLimit: number | null,
  distanceUnit: string,
  distanceLimitUnit: string,
  isMaxLimit: boolean
) => {
  if (distanceLimit === null) return;

  const distanceInMeters = ConvertDistanceToMeter(distance, distanceUnit);
  const distanceLimitInMeters = ConvertDistanceToMeter(
    distanceLimit,
    distanceLimitUnit
  );

  if (isMaxLimit) {
    return distanceInMeters <= distanceLimitInMeters;
  } else {
    return distanceInMeters >= distanceLimitInMeters;
  }
};

import { NumberRange } from "../../typings";
import { ConvertDistanceToMeter } from "./ConvertDistanceToMeter";

export const IsDistanceWithinNumberRange = (
  numberRange: NumberRange,
  distance: number,
  distanceUnit: string,
  filterDistanceRangeUnit: string
) => {
  const distanceInMeters = ConvertDistanceToMeter(distance, distanceUnit);
  const startDistance = ConvertDistanceToMeter(
    numberRange.start,
    filterDistanceRangeUnit
  );
  const endDistance = ConvertDistanceToMeter(
    numberRange.end,
    filterDistanceRangeUnit
  );

  return distanceInMeters >= startDistance && distanceInMeters <= endDistance;
};

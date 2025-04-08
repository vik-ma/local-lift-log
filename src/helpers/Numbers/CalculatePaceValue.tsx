import { ConvertNumberToTwoDecimals, IsNumberValidAndAbove0 } from "..";

export const CalculatePaceValue = (
  distance: number,
  distanceUnit: string,
  timeInSeconds: number,
  paceUnit: string
) => {
  if (
    !IsNumberValidAndAbove0(distance) ||
    !IsNumberValidAndAbove0(timeInSeconds)
  )
    return 0;

  const distanceToMeters: { [unit in typeof distanceUnit]: number } = {
    km: 1000,
    m: 1,
    mi: 1609.34,
    ft: 0.3048,
    yd: 0.9144,
  };

  const conversion = distanceToMeters[distanceUnit];

  if (conversion === undefined) return 0;

  const distanceInMeters = distance * conversion;

  let paceDistance: number;
  let time: number;

  switch (paceUnit) {
    case "min/km":
      paceDistance = distanceInMeters / 1000;
      time = timeInSeconds / 60;
      return ConvertNumberToTwoDecimals(time / paceDistance);
    case "s/m":
      paceDistance = distanceInMeters;
      time = timeInSeconds;
      return ConvertNumberToTwoDecimals(time / paceDistance);
    case "min/mi":
      paceDistance = distanceInMeters / 1609.34;
      time = timeInSeconds / 60;
      return ConvertNumberToTwoDecimals(time / paceDistance);
    case "s/yd":
      paceDistance = distanceInMeters / 0.9144;
      time = timeInSeconds;
      return ConvertNumberToTwoDecimals(time / paceDistance);
    default:
      return 0;
  }
};

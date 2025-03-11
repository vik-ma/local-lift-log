import { ConvertNumberToTwoDecimals } from "./ConvertNumberToTwoDecimals";
import { IsNumberValidAndAbove0 } from "./IsNumberValidAndAbove0";

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

  const distanceInMeters = (() => {
    switch (distanceUnit) {
      case "km":
        return distance * 1000;
      case "m":
        return distance;
      case "mi":
        return distance * 1609.34;
      case "yd":
        return distance * 0.9144;
      case "ft":
        return distance * 0.3048;
      default:
        return 0;
    }
  })();

  const paceInMetersPerSecond = distanceInMeters / timeInSeconds;

  switch (paceUnit) {
    case "m/s":
      return ConvertNumberToTwoDecimals(paceInMetersPerSecond);
    case "km/h":
      return ConvertNumberToTwoDecimals(paceInMetersPerSecond * 3.6);
    case "mph":
      return ConvertNumberToTwoDecimals(paceInMetersPerSecond * 2.23694);
    case "fps":
      return ConvertNumberToTwoDecimals(paceInMetersPerSecond * 3.28084);
    default:
      return 0;
  }
};

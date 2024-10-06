export const ConvertDistanceToMeter = (
  distance: number,
  unit: string
): number => {
  switch (unit) {
    case "km":
      return distance * 1000;
    case "mi":
      return distance * 1609.34;
    case "yd":
      return distance * 0.9144;
    case "ft":
      return distance * 0.3048;
    case "m":
      return distance;
    default:
      return distance;
  }
};

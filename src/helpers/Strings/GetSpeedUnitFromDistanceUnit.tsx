export const GetSpeedUnitFromDistanceUnit = (unit: string) => {
  if (unit === "m" || unit === "km") return "km/h";

  return "mph";
};

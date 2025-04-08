export const GetPaceUnitFromDistanceUnit = (unit: string) => {
  if (unit === "m" || unit === "km") return "min/km";

  return "min/mi";
};

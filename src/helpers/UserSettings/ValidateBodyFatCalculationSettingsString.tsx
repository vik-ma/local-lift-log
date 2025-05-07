import { BodyFatCalculationAgeGroups, IsNumberValidId } from "..";

export const ValidateBodyFatCalculationSettingsString = (
  bodyFatCalculationSettingsString: string
) => {
  const stats = bodyFatCalculationSettingsString.split("/");

  if (stats.length !== 3) return false;

  if (stats[0] !== "male" && stats[0] !== "female") return false;

  const validAgeGroups = BodyFatCalculationAgeGroups();

  if (!validAgeGroups.has(stats[1])) return false;

  const measurementIds = stats[2].split(",");

  if (measurementIds.length !== 4) return false;

  const seenMeasurementIds = new Set<string>();

  for (const id of measurementIds) {
    if (!IsNumberValidId(Number(id)) || seenMeasurementIds.has(id))
      return false;
    seenMeasurementIds.add(id);
  }

  return true;
};

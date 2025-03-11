import { UserSettings } from "../../typings";
import { ValidDistanceUnits } from "../Constants/ValidDistanceUnits";
import { ValidMeasurementUnits } from "../Constants/ValidMeasurementUnits";
import { ValidWeightUnits } from "../Constants/ValidWeightUnits";

export const GetValidatedUserSettingsUnits = (
  userSettings: UserSettings
): { weightUnit: string; distanceUnit: string; measurementUnit: string } => {
  const validWeightUnits = ValidWeightUnits();
  const validDistanceUnits = ValidDistanceUnits();
  const validMeasurementUnits = ValidMeasurementUnits();

  // Return first valid unit if unit is invalid
  // (First valid units are all metric units)
  return {
    weightUnit: validWeightUnits.includes(userSettings.default_unit_weight)
      ? userSettings.default_unit_weight
      : validWeightUnits[0],
    distanceUnit: validDistanceUnits.includes(
      userSettings.default_unit_distance
    )
      ? userSettings.default_unit_distance
      : validDistanceUnits[0],
    measurementUnit: validMeasurementUnits.includes(
      userSettings.default_unit_measurement
    )
      ? userSettings.default_unit_measurement
      : validMeasurementUnits[0],
  };
};

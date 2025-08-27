import { GetValidatedUnit } from "..";
import { UserSettings } from "../../typings";

export const ValidateAndModifyDefaultUnits = (
  userSettings: UserSettings,
  unitsToValidate: Set<"weight" | "distance" | "measurement">
) => {
  for (const unit of unitsToValidate) {
    switch (unit) {
      case "weight": {
        userSettings.default_unit_weight = GetValidatedUnit(
          userSettings.default_unit_weight,
          "weight"
        );

        break;
      }
      case "distance": {
        userSettings.default_unit_distance = GetValidatedUnit(
          userSettings.default_unit_distance,
          "distance"
        );

        break;
      }
      case "measurement": {
        userSettings.default_unit_measurement = GetValidatedUnit(
          userSettings.default_unit_measurement,
          "circumference"
        );

        break;
      }
      default:
        break;
    }
  }
};

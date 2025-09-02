import {
  VALID_DISTANCE_UNITS,
  VALID_MEASUREMENT_UNITS,
  VALID_WEIGHT_UNITS,
} from "../../constants";

type UnitType = "weight" | "distance" | "caliper" | "circumference";

export const GetValidatedUnit = (unit: string, unitType: UnitType) => {
  if (unitType === "weight") {
    if (VALID_WEIGHT_UNITS.includes(unit)) return unit;

    return VALID_WEIGHT_UNITS[0];
  }

  if (unitType === "distance") {
    if (VALID_DISTANCE_UNITS.includes(unit)) return unit;

    return VALID_DISTANCE_UNITS[0];
  }

  if (unitType === "caliper") {
    return "mm";
  }

  if (unitType === "circumference") {
    if (VALID_MEASUREMENT_UNITS.includes(unit)) return unit;

    return VALID_MEASUREMENT_UNITS[0];
  }

  return "";
};

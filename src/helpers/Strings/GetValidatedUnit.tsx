import {
  DISTANCE_UNITS,
  MEASUREMENT_UNITS,
  WEIGHT_UNITS,
} from "../../constants";

type UnitType = "weight" | "distance" | "caliper" | "circumference";

export const GetValidatedUnit = (unit: string, unitType: UnitType) => {
  if (unitType === "weight") {
    if (WEIGHT_UNITS.includes(unit)) return unit;

    return WEIGHT_UNITS[0];
  }

  if (unitType === "distance") {
    if (DISTANCE_UNITS.includes(unit)) return unit;

    return DISTANCE_UNITS[0];
  }

  if (unitType === "caliper") {
    return "mm";
  }

  if (unitType === "circumference") {
    if (MEASUREMENT_UNITS.includes(unit)) return unit;

    return MEASUREMENT_UNITS[0];
  }

  return "";
};

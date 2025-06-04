import {
  ValidDistanceUnits,
  ValidMeasurementUnits,
  ValidWeightUnits,
} from "..";

type UnitType = "weight" | "distance" | "caliper" | "circumference";

export const GetValidatedUnit = (unit: string, unitType: UnitType) => {
  if (unitType === "weight") {
    if (ValidWeightUnits().includes(unit)) return unit;

    return ValidWeightUnits()[0];
  }

  if (unitType === "distance") {
    if (ValidDistanceUnits().includes(unit)) return unit;

    return ValidDistanceUnits()[0];
  }

  if (unitType === "caliper") {
    return "mm";
  }

  if (unitType === "circumference") {
    if (ValidMeasurementUnits().includes(unit)) return unit;

    return ValidMeasurementUnits()[0];
  }

  return "";
};

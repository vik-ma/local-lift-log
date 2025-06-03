import { ValidWeightUnits } from "..";

type UnitType = "weight";

export const GetValidatedUnit = (unit: string, unitType: UnitType) => {
  if (unitType === "weight") {
    if (ValidWeightUnits().includes(unit)) return unit;

    return ValidWeightUnits()[0];
  }

  return "";
};

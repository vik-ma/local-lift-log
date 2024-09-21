import {
  CalculationItemType,
  Distance,
  EquipmentWeight,
  CalculationListItem,
} from "../../typings";
import { ConvertDistanceValue, ConvertWeightValue } from "..";

export const CreateNewCalculationItem = (
  itemType: CalculationItemType,
  unit: string,
  multiplier: number,
  number?: number,
  calculationString?: string,
  equipmentWeight?: EquipmentWeight,
  distance?: Distance
): CalculationListItem | undefined => {
  if (itemType === "number" && number) {
    const calculationItem: CalculationListItem = {
      itemType: "number",
      label: `${number} ${unit}`,
      value: number,
      unit: unit,
      multiplierInput: multiplier === 1 ? "" : multiplier.toString(),
      multiplier: multiplier ?? 1,
      isMultiplierInputInvalid: false,
      disableDecreaseMultiplierButton: multiplier > 1 ? false : true,
      disableIncreaseMultiplierButton: false,
    };

    return calculationItem;
  }

  if (itemType === "calculation" && calculationString && number) {
    const calculationItem: CalculationListItem = {
      itemType: "calculation",
      label: calculationString,
      value: number,
      unit: unit,
      multiplierInput: multiplier === 1 ? "" : multiplier.toString(),
      multiplier: multiplier ?? 1,
      isMultiplierInputInvalid: false,
      disableDecreaseMultiplierButton: multiplier > 1 ? false : true,
      disableIncreaseMultiplierButton: false,
    };

    return calculationItem;
  }

  if (itemType === "preset" && equipmentWeight) {
    // Convert weight value if unit prop does not match Preset unit
    const weightValue =
      equipmentWeight.weight_unit !== unit
        ? ConvertWeightValue(
            equipmentWeight.weight,
            equipmentWeight.weight_unit,
            unit
          )
        : equipmentWeight.weight;

    const calculationItem: CalculationListItem = {
      itemType: "preset",
      label: equipmentWeight.name,
      value: weightValue,
      unit: unit,
      multiplierInput: multiplier === 1 ? "" : multiplier.toString(),
      multiplier: multiplier ?? 1,
      isMultiplierInputInvalid: false,
      disableDecreaseMultiplierButton: multiplier > 1 ? false : true,
      disableIncreaseMultiplierButton: false,
      equipmentWeight: equipmentWeight,
    };

    return calculationItem;
  }

  if (itemType === "preset" && distance) {
    // Convert distance value if unit prop does not match Preset unit
    const distanceValue =
      distance.distance_unit !== unit
        ? ConvertDistanceValue(distance.distance, distance.distance_unit, unit)
        : distance.distance;

    const calculationItem: CalculationListItem = {
      itemType: "preset",
      label: distance.name,
      value: distanceValue,
      unit: unit,
      multiplierInput: multiplier === 1 ? "" : multiplier.toString(),
      multiplier: multiplier ?? 1,
      isMultiplierInputInvalid: false,
      disableDecreaseMultiplierButton: multiplier > 1 ? false : true,
      disableIncreaseMultiplierButton: false,
      distance: distance,
    };
    return calculationItem;
  }

  return undefined;
};

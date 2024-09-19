import {
  CalculationItemType,
  Distance,
  EquipmentWeight,
  CalculationListItem,
} from "../../typings";

export const CreateNewCalculationItem = (
  itemType: CalculationItemType,
  unit: string,
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
      multiplierInput: "",
      multiplier: 1,
      isMultiplierInputInvalid: false,
      disableDecreaseMultiplierButton: true,
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
      multiplierInput: "",
      multiplier: 1,
      isMultiplierInputInvalid: false,
      disableDecreaseMultiplierButton: true,
      disableIncreaseMultiplierButton: false,
    };

    return calculationItem;
  }

  if (itemType === "preset" && equipmentWeight) {
    const calculationItem: CalculationListItem = {
      itemType: "preset",
      label: equipmentWeight.name,
      value: equipmentWeight.weight,
      unit: equipmentWeight.weight_unit,
      multiplierInput: "",
      multiplier: 1,
      isMultiplierInputInvalid: false,
      disableDecreaseMultiplierButton: true,
      disableIncreaseMultiplierButton: false,
      equipmentWeight: equipmentWeight,
    };

    return calculationItem;
  }

  if (itemType === "preset" && distance) {
    const calculationItem: CalculationListItem = {
      itemType: "preset",
      label: distance.name,
      value: distance.distance,
      unit: distance.distance_unit,
      multiplierInput: "",
      multiplier: 1,
      isMultiplierInputInvalid: false,
      disableDecreaseMultiplierButton: true,
      disableIncreaseMultiplierButton: false,
      distance: distance,
    };
    return calculationItem;
  }

  return undefined;
};

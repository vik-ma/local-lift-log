import {
  CalculationListItem,
  Distance,
  EquipmentWeight,
  PresetsType,
} from "../../typings";
import { CreateNewCalculationItem } from "./CreateNewCalculationItem";

const createCalculationItemNumber = (number: number, unit: string) => {
  const calculationItem = CreateNewCalculationItem("number", unit, number);

  return calculationItem;
};

const createCalculationItemEquipmentWeight = (
  presetId: number,
  unit: string,
  equipmentWeights: EquipmentWeight[]
) => {
  const equipment = equipmentWeights.find((item) => item.id === presetId);

  if (equipment !== undefined) {
    const calculationItem = CreateNewCalculationItem(
      "preset",
      unit,
      undefined,
      undefined,
      equipment
    );

    return calculationItem;
  }
};

const createCalculationItemDistance = (
  presetId: number,
  unit: string,
  distances: Distance[]
) => {
  const distance = distances.find((item) => item.id === presetId);

  if (distance !== undefined) {
    const calculationItem = CreateNewCalculationItem(
      "preset",
      unit,
      undefined,
      undefined,
      undefined,
      distance
    );

    return calculationItem;
  }
};

export const LoadCalculationString = (
  calculationString: string,
  unit: string,
  presetsType: PresetsType,
  equipmentWeights: EquipmentWeight[],
  distances: Distance[]
): CalculationListItem[] => {
  const calculationStrings = calculationString.split("/");

  if (calculationStrings.length === 0) return [];

  const calculationList: CalculationListItem[] = [];

  const regexEquipment = /^e\[.*\]$/;
  const regexDistance = /^d\[.*\]$/;

  const regexNumber = /^n\d+(\.\d{1,2})?$/;
  const regexPreset = /^p([1-9]\d*)$/;

  for (const string of calculationStrings) {
    if (
      (presetsType === "equipment" && regexEquipment.test(string)) ||
      (presetsType === "distance" && regexDistance.test(string))
    ) {
      const calculationItems = string.split(",");

      for (const item of calculationItems) {
        const numberMatch = item.match(regexNumber);

        if (numberMatch && numberMatch[1]) {
          const number = parseFloat(numberMatch[1]);
          const calculationItem = createCalculationItemNumber(number, unit);

          if (calculationItem !== undefined)
            calculationList.push(calculationItem);
        }

        const presetMatch = item.match(regexPreset);

        if (presetMatch && presetMatch[1]) {
          const presetId = parseInt(presetMatch[1]);

          if (presetsType === "equipment") {
            const calculationItem = createCalculationItemEquipmentWeight(
              presetId,
              unit,
              equipmentWeights
            );

            if (calculationItem !== undefined)
              calculationList.push(calculationItem);
          }

          if (presetsType === "distance") {
            const calculationItem = createCalculationItemDistance(
              presetId,
              unit,
              distances
            );

            if (calculationItem !== undefined)
              calculationList.push(calculationItem);
          }
        }
      }
    }
  }

  return calculationList;
};

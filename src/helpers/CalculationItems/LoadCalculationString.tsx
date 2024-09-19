import {
  CalculationListItem,
  Distance,
  EquipmentWeight,
  PresetsType,
} from "../../typings";
import { CreateNewCalculationItem } from "./CreateNewCalculationItem";

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

          const calculationItem = CreateNewCalculationItem(
            "number",
            unit,
            number
          );

          if (calculationItem !== undefined)
            calculationList.push(calculationItem);
        }

        const presetMatch = item.match(regexPreset);

        if (presetMatch && presetMatch[1]) {
          const presetId = parseInt(presetMatch[1]);

          if (presetsType === "equipment") {
            const equipment = equipmentWeights.find(
              (item) => item.id === presetId
            );

            if (equipment !== undefined) {
              const calculationItem = CreateNewCalculationItem(
                "preset",
                unit,
                undefined,
                undefined,
                equipment
              );

              if (calculationItem !== undefined)
                calculationList.push(calculationItem);
            }
          }

          if (presetsType === "distance") {
            const distance = distances.find(
              (item) => item.id === presetId
            );

            if (distance !== undefined) {
              const calculationItem = CreateNewCalculationItem(
                "preset",
                unit,
                undefined,
                undefined,
                undefined,
                distance
              );

              if (calculationItem !== undefined)
                calculationList.push(calculationItem);
            }
          }
        }
      }
    }
  }

  return calculationList;
};

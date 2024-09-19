import { CalculationListItem, PresetsType } from "../../typings";
import { CreateNewCalculationItem } from "./CreateNewCalculationItem";

export const LoadCalculationString = (
  calculationString: string,
  unit: string,
  presetsType: PresetsType
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
      }
    }
  }

  return calculationList;
};

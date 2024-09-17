import { CalculationListItem, PresetsType } from "../../typings";

export const CreateCalculationString = (
  calculationList: CalculationListItem[],
  presetType: PresetsType
) => {
  const stringList: string[] = [];

  for (const calculationItem of calculationList) {
    if (calculationItem.itemType === "number") {
      const string = `n${calculationItem.value}`;
      stringList.push(string);
    }

    if (calculationItem.itemType === "calculation") {
      const string = `c${calculationItem.label}`;
      stringList.push(string);
    }

    if (calculationItem.itemType === "preset") {
      if (calculationItem.equipmentWeight !== undefined) {
        const string = `p${calculationItem.equipmentWeight.id}`;
        stringList.push(string);
      }

      if (calculationItem.distance !== undefined) {
        const string = `p${calculationItem.distance.id}`;
        stringList.push(string);
      }
    }

    const calculationString = stringList.join(",");

    return calculationString;
  }
};

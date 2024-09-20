import { CalculationListItem, PresetsType } from "../../typings";

export const CreateCalculationString = (
  calculationList: CalculationListItem[],
  presetsType: PresetsType
) => {
  const stringList: string[] = [];

  for (const calculationItem of calculationList) {
    const itemString: string =
      calculationItem.itemType === "preset" && calculationItem.equipmentWeight
        ? `p${calculationItem.equipmentWeight.id}`
        : calculationItem.itemType === "preset" && calculationItem.distance
        ? `p${calculationItem.distance.id}`
        : calculationItem.itemType === "calculation"
        ? `c(${calculationItem.label})`
        : `n${calculationItem.value}`;

    stringList.push(itemString);
  }

  const listString = stringList.join(",");

  const calculationString =
    presetsType === "equipment" ? `e[${listString}]` : `d[${listString}]`;

  return calculationString;
};

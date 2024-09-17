import { CalculationListItem } from "../../typings";

export const CreateCalculationString = (
  calculationList: CalculationListItem[]
) => {
  const stringList: string[] = [];

  for (const calculationItem of calculationList) {
    const itemString: string =
      calculationItem.itemType === "preset" && calculationItem.equipmentWeight
        ? `p${calculationItem.equipmentWeight.id}`
        : calculationItem.itemType === "preset" && calculationItem.distance
        ? `p${calculationItem.distance.id}`
        : calculationItem.itemType === "calculation"
        ? `c${calculationItem.label}`
        : `n${calculationItem.value}`;

    stringList.push(itemString);
  }

  const calculationString = stringList.join(",");

  return calculationString;
};

import { CalculationListItem, PresetsType } from "../../typings";

export const CreateCalculationString = (
  calculationList: CalculationListItem[],
  presetsType: PresetsType,
  totalMultiplier: number
) => {
  const stringList: string[] = [];

  for (const calculationItem of calculationList) {
    const itemString: string =
      calculationItem.itemType === "preset" && calculationItem.equipmentWeight
        ? `p${calculationItem.equipmentWeight.id}x${calculationItem.multiplier}`
        : calculationItem.itemType === "preset" && calculationItem.distance
        ? `p${calculationItem.distance.id}x${calculationItem.multiplier}`
        : calculationItem.itemType === "calculation"
        ? `c(${calculationItem.label})x${calculationItem.multiplier}`
        : `n${calculationItem.value}x${calculationItem.multiplier}`;

    stringList.push(itemString);
  }

  const listString = stringList.join(",");

  const calculationString =
    presetsType === "equipment"
      ? `e[${listString}]x${totalMultiplier}`
      : `d[${listString}]x${totalMultiplier}`;

  return calculationString;
};

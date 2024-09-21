import { CalculationListItem, PresetsType } from "../../typings";
import { ConvertNumberToTwoDecimals } from "..";

export const CreateCalculationString = (
  calculationList: CalculationListItem[],
  presetsType: PresetsType,
  totalMultiplier: number
) => {
  const stringList: string[] = [];

  for (const calculationItem of calculationList) {
    const multiplier = ConvertNumberToTwoDecimals(calculationItem.multiplier);

    const itemString: string =
      calculationItem.itemType === "preset" && calculationItem.equipmentWeight
        ? `p${calculationItem.equipmentWeight.id}x${multiplier}`
        : calculationItem.itemType === "preset" && calculationItem.distance
        ? `p${calculationItem.distance.id}x${multiplier}`
        : calculationItem.itemType === "calculation"
        ? `c(${calculationItem.label})x${multiplier}`
        : `n${ConvertNumberToTwoDecimals(calculationItem.value)}x${multiplier}`;

    stringList.push(itemString);
  }

  const listString = stringList.join(",");

  const calculationString =
    presetsType === "equipment"
      ? `e[${listString}]x${ConvertNumberToTwoDecimals(totalMultiplier)}`
      : `d[${listString}]x${ConvertNumberToTwoDecimals(totalMultiplier)}`;

  return calculationString;
};

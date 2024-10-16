import { AvailablePlates } from "../../typings";

export const GenerateAvailablePlatesString = (
  availablePlates: AvailablePlates[]
) => {
  const plateStrings: string[] = [];

  for (const plate of availablePlates) {
    const plateString = `${plate.equipmentWeightId}x${plate.numAvailable}`;
    plateStrings.push(plateString);
  }

  return plateStrings.join(",");
};

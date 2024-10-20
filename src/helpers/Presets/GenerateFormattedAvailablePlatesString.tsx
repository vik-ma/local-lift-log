import { AvailablePlatesMap } from "../../typings";

export const GenerateFormattedAvailablePlatesString = (
  availablePlatesMap: AvailablePlatesMap
) => {
  const availablePlatesStrings: string[] = [];
  const availablePlatesWeightStrings: string[] = [];
  const availablePlatesMapStrings: string[] = [];

  for (const [key, value] of availablePlatesMap) {
    availablePlatesStrings.push(`${key.id}x${value}`);
    availablePlatesWeightStrings.push(key.weight.toString());
    availablePlatesMapStrings.push(`${key.weight}: ${value}`);
  }

  const available_plates_string = availablePlatesStrings.join(",");
  const formattedAvailablePlatesString =
    availablePlatesWeightStrings.join(", ");
  const formattedAvailablePlatesMapString =
    availablePlatesMapStrings.join(", ");

  return {
    available_plates_string,
    formattedAvailablePlatesString,
    formattedAvailablePlatesMapString,
  };
};

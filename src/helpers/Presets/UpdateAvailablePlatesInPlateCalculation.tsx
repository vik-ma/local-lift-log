import { GenerateFormattedAvailablePlatesString } from "..";
import { AvailablePlatesMap, PlateCollection } from "../../typings";

export const UpdateAvailablePlatesInPlateCalculation = (
  plateCalculation: PlateCollection,
  availablePlatesMap: AvailablePlatesMap
) => {
  const {
    available_plates_string,
    formattedAvailablePlatesString,
    formattedAvailablePlatesMapString,
  } = GenerateFormattedAvailablePlatesString(availablePlatesMap);

  const updatedPlateCalculation = {
    ...plateCalculation,
    available_plates_string,
    availablePlatesMap: availablePlatesMap,
    formattedAvailablePlatesString,
    formattedAvailablePlatesMapString,
  };

  return updatedPlateCalculation;
};

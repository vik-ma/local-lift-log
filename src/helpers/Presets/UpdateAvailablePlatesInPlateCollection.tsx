import { GenerateFormattedAvailablePlatesString } from "..";
import { AvailablePlatesMap, PlateCollection } from "../../typings";

export const UpdateAvailablePlatesInPlateCollection = (
  plateCollection: PlateCollection,
  availablePlatesMap: AvailablePlatesMap
) => {
  const {
    available_plates_string,
    formattedAvailablePlatesString,
    formattedAvailablePlatesMapString,
  } = GenerateFormattedAvailablePlatesString(availablePlatesMap);

  const updatedPlateCollection = {
    ...plateCollection,
    available_plates_string,
    availablePlatesMap: availablePlatesMap,
    formattedAvailablePlatesString,
    formattedAvailablePlatesMapString,
  };

  return updatedPlateCollection;
};

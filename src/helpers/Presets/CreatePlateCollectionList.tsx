import { EquipmentWeight, PlateCollection } from "../../typings";
import {
  GenerateFormattedAvailablePlatesString,
  GetValidatedUnit,
  IsNumberDivisibleBy2,
  IsStringEmpty,
} from "..";

export const CreatePlateCollectionList = (
  plateCollections: PlateCollection[],
  equipmentWeightMap: Map<number, EquipmentWeight>
) => {
  const plateCollectionList: PlateCollection[] = [];

  for (const plate of plateCollections) {
    if (
      IsStringEmpty(plate.name) ||
      (plate.num_handles !== 1 && plate.num_handles !== 2)
    )
      continue;

    const weightUnit = GetValidatedUnit(plate.weight_unit, "weight");

    const availablePlatesMap = new Map<EquipmentWeight, number>();

    const handle = equipmentWeightMap.get(plate.handle_id);

    const availablePlateStrings = plate.available_plates_string.split(",");

    for (const str of availablePlateStrings) {
      const plateAvailability = str.split("x");

      const id = plateAvailability[0];
      const numAvailable = plateAvailability[1];
      const plate = equipmentWeightMap.get(Number(id));

      if (
        id !== undefined &&
        plate !== undefined &&
        numAvailable !== undefined &&
        IsNumberDivisibleBy2(Number(numAvailable)) &&
        plate.weight_unit === weightUnit
      ) {
        availablePlatesMap.set(plate, Number(numAvailable));
      }
    }

    const {
      formattedAvailablePlatesString,
      formattedAvailablePlatesMapString,
    } = GenerateFormattedAvailablePlatesString(availablePlatesMap);

    const plateCollection: PlateCollection = {
      ...plate,
      // Don't add handle if handle's weight_unit doesn't match current Plate Collection's weight_unit
      handle:
        handle !== undefined && handle.weight_unit === weightUnit
          ? handle
          : undefined,
      availablePlatesMap,
      formattedAvailablePlatesString,
      formattedAvailablePlatesMapString,
    };

    plateCollectionList.push(plateCollection);
  }

  return plateCollectionList;
};

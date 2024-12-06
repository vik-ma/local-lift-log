import { EquipmentWeight, PlateCollection } from "../../typings";
import {
  GenerateFormattedAvailablePlatesString,
  IsNumberDivisibleBy2,
} from "..";

export const CreatePlateCalculationList = (
  plateCalculations: PlateCollection[],
  equipmentWeights: EquipmentWeight[]
) => {
  const equipmentWeightMap: Map<string, EquipmentWeight> =
    equipmentWeights.reduce(
      (map, equipment) => map.set(equipment.id.toString(), equipment),
      new Map<string, EquipmentWeight>()
    );

  const plateCalculationList: PlateCollection[] = [];

  for (const plate of plateCalculations) {
    const weightUnit = plate.weight_unit;

    const availablePlatesMap = new Map<EquipmentWeight, number>();

    const handle = equipmentWeightMap.get(plate.handle_id.toString());

    const availablePlateStrings = plate.available_plates_string.split(",");

    for (const str of availablePlateStrings) {
      const plateAvailability = str.split("x");

      const id = plateAvailability[0];
      const numAvailable = plateAvailability[1];
      const plate = equipmentWeightMap.get(id);

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

    const plateCalculation: PlateCollection = {
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

    plateCalculationList.push(plateCalculation);
  }

  return plateCalculationList;
};

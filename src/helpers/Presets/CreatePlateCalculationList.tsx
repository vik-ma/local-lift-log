import { EquipmentWeight, PlateCalculation } from "../../typings";
import { IsNumberDivisibleBy2 } from "..";

export const CreatePlateCalculationList = (
  plateCalculations: PlateCalculation[],
  equipmentWeights: EquipmentWeight[]
) => {
  const equipmentWeightMap: Map<string, EquipmentWeight> =
    equipmentWeights.reduce(
      (map, equipment) => map.set(equipment.id.toString(), equipment),
      new Map<string, EquipmentWeight>()
    );

  const plateCalculationList: PlateCalculation[] = [];

  for (const plate of plateCalculations) {
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
        IsNumberDivisibleBy2(Number(numAvailable))
      ) {
        availablePlatesMap.set(plate, Number(numAvailable));
      }
    }

    const formattedAvailablePlatesString = Array.from(availablePlatesMap)
      .map(([key, value]) => `${key.weight}: ${value}`)
      .join(", ");

    const plateCalculation: PlateCalculation = {
      ...plate,
      handle,
      availablePlatesMap,
      formattedAvailablePlatesString,
    };

    plateCalculationList.push(plateCalculation);
  }

  return plateCalculationList;
};

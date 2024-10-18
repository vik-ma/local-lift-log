import Database from "tauri-plugin-sql-api";
import { CreateDefaultPlateCalculations, DefaultEquipmentWeights } from "..";

export const CreateDefaultEquipmentWeights = async (isMetric: boolean) => {
  const DEFAULT_EQUIPMENT_WEIGHTS = DefaultEquipmentWeights(isMetric);

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const weightIdList: number[] = [];
    let handleId = 0;

    for (let i = 0; i < DEFAULT_EQUIPMENT_WEIGHTS.length; i++) {
      const equipment = DEFAULT_EQUIPMENT_WEIGHTS[i];

      const result = await db.execute(
        `INSERT into equipment_weights 
         (name, weight, weight_unit, is_favorite, is_in_plate_calculator) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          equipment.name,
          equipment.weight,
          equipment.weight_unit,
          equipment.is_favorite,
          equipment.is_in_plate_calculator,
        ]
      );

      if (equipment.name === "Barbell") {
        handleId = result.lastInsertId;
      } else if (equipment.name !== "Dumbbell") {
        weightIdList.push(result.lastInsertId);
      }
    }

    await CreateDefaultPlateCalculations(weightIdList, handleId);
  } catch (error) {
    console.log(error);
  }
};

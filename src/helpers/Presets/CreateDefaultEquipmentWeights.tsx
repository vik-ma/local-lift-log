import Database from "tauri-plugin-sql-api";
import { CreateDefaultPlateCollections, DefaultEquipmentWeights } from "..";

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
         (name, weight, weight_unit, is_favorite) 
         VALUES ($1, $2, $3, $4)`,
        [
          equipment.name,
          equipment.weight,
          equipment.weight_unit,
          equipment.is_favorite,
        ]
      );

      if (equipment.name === "Barbell") {
        handleId = result.lastInsertId;
      } else if (equipment.name !== "Dumbbell") {
        weightIdList.push(result.lastInsertId);
      }
    }

    await CreateDefaultPlateCollections(weightIdList, handleId, isMetric);
  } catch (error) {
    console.log(error);
  }
};

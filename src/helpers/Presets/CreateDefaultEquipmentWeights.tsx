import Database from "tauri-plugin-sql-api";
import { DefaultEquipmentWeights } from "..";

export const CreateDefaultEquipmentWeights = async (isMetric: boolean) => {
  const DEFAULT_EQUIPMENT_WEIGHTS = DefaultEquipmentWeights(isMetric);

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    DEFAULT_EQUIPMENT_WEIGHTS.forEach((equipment) => {
      db.execute(
        `INSERT into equipment_weights (name, weight, weight_unit, is_favorite) 
         VALUES ($1, $2, $3, $4)`,
        [
          equipment.name,
          equipment.weight,
          equipment.weight_unit,
          equipment.is_favorite,
        ]
      );
    });
  } catch (error) {
    console.log(error);
  }
};

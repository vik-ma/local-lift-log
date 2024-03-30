import Database from "tauri-plugin-sql-api";
import { DefaultEquipmentWeightList } from "..";

export const CreateDefaultEquipmentWeights = async (isMetric: boolean) => {
  const defaultEquipmentWeightList = DefaultEquipmentWeightList(isMetric);

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    defaultEquipmentWeightList.forEach((equipment) => {
      db.execute(
        "INSERT into equipment_weights (name, weight, weight_unit) VALUES ($1, $2, $3)",
        [equipment.name, equipment.weight, equipment.weight_unit]
      );
    });
  } catch (error) {
    console.log(error);
  }
};

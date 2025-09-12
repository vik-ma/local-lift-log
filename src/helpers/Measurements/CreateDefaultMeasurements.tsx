import Database from "@tauri-apps/plugin-sql";
import { GetDefaultMeasurements } from "..";

export const CreateDefaultMeasurements = async (isMetric: boolean) => {
  const DEFAULT_MEASUREMENTS = GetDefaultMeasurements(isMetric);

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    for (let i = 0; i < DEFAULT_MEASUREMENTS.length; i++) {
      await db.execute(
        `INSERT into measurements (name, default_unit, measurement_type, is_favorite) 
        VALUES ($1, $2, $3, $4)`,
        [
          DEFAULT_MEASUREMENTS[i].name,
          DEFAULT_MEASUREMENTS[i].default_unit,
          DEFAULT_MEASUREMENTS[i].measurement_type,
          0,
        ]
      );
    }
  } catch (error) {
    console.log(error);
  }
};

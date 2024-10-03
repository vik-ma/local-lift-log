import Database from "tauri-plugin-sql-api";
import { DefaultMeasurements } from "..";
import { Measurement } from "../../typings";

export const CreateDefaultMeasurements = async (
  isMetric: boolean
): Promise<Measurement[]> => {
  const DEFAULT_MEASUREMENTS = DefaultMeasurements(isMetric);

  const newMeasurementList: Measurement[] = [];

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    for (let i = 0; i < DEFAULT_MEASUREMENTS.length; i++) {
      const result = await db.execute(
        `INSERT into measurements (name, default_unit, measurement_type, is_favorite) 
        VALUES ($1, $2, $3, $4)`,
        [
          DEFAULT_MEASUREMENTS[i].name,
          DEFAULT_MEASUREMENTS[i].default_unit,
          DEFAULT_MEASUREMENTS[i].measurement_type,
          0,
        ]
      );

      const newMeasurement: Measurement = {
        id: result.lastInsertId,
        name: DEFAULT_MEASUREMENTS[i].name,
        default_unit: DEFAULT_MEASUREMENTS[i].default_unit,
        measurement_type: DEFAULT_MEASUREMENTS[i].measurement_type,
        is_favorite: 0,
      };

      newMeasurementList.push(newMeasurement);
    }
  } catch (error) {
    console.log(error);
  }

  return newMeasurementList;
};

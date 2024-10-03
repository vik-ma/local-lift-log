import { Measurement } from "../../typings";
import Database from "tauri-plugin-sql-api";

export const InsertMeasurementIntoDatabase = async (
  measurement: Measurement
): Promise<number> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into measurements (name, default_unit, measurement_type, is_favorite) 
      VALUES ($1, $2, $3, $4)`,
      [
        measurement.name,
        measurement.default_unit,
        measurement.measurement_type,
        measurement.is_favorite,
      ]
    );

    return result.lastInsertId;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

import { Measurement } from "../../typings";
import Database from "tauri-plugin-sql-api";

export const InsertMeasurementIntoDatabase = async (
  measurement: Measurement
): Promise<number> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      "INSERT into measurements (name, default_unit, measurement_type) VALUES ($1, $2, $3)",
      [measurement.name, measurement.default_unit, measurement.measurement_type]
    );

    return result.lastInsertId;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

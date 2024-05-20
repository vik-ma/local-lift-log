import Database from "tauri-plugin-sql-api";
import { DefaultMeasurements } from "..";

export const CreateDefaultMeasurements = async (isMetric: boolean) => {
  const DEFAULT_MEASUREMENTS = DefaultMeasurements(isMetric);

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    DEFAULT_MEASUREMENTS.forEach((measurement) => {
      db.execute(
        "INSERT into measurements (name, default_unit, measurement_type) VALUES ($1, $2, $3)",
        [
          measurement.name,
          measurement.default_unit,
          measurement.measurement_type,
        ]
      );
    });
  } catch (error) {
    console.log(error);
  }
};

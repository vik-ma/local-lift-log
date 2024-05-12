import Database from "tauri-plugin-sql-api";
import { DefaultMeasurementList } from "..";

export const CreateDefaultMeasurementList = async (isMetric: boolean) => {
  const defaultMeasurementList = DefaultMeasurementList(isMetric);

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    defaultMeasurementList.forEach((measurement) => {
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

import Database from "tauri-plugin-sql-api";
import { Measurement, MeasurementMap } from "../../typings";

export const GetMeasurementsMap = async (): Promise<MeasurementMap> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: Measurement[] = await db.select("SELECT * FROM measurements");

    const measurementMap: MeasurementMap = result.reduce((acc, item) => {
      acc[item.id] = {
        name: item.name,
        default_unit: item.default_unit,
        measurement_type: item.measurement_type,
      };
      return acc;
    }, {} as MeasurementMap);

    return measurementMap;
  } catch (error) {
    console.log(error);
    return {};
  }
};

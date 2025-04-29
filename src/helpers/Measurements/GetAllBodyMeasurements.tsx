import Database from "tauri-plugin-sql-api";
import { BodyMeasurements, MeasurementMap } from "../../typings";
import { CreateDetailedBodyMeasurementsList } from "..";

export const GetAllBodyMeasurements = async (
  clockStyle: string,
  measurementMap: MeasurementMap
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<BodyMeasurements[]>(
      "SELECT * FROM body_measurements"
    );

    const detailedBodyMeasurements = CreateDetailedBodyMeasurementsList(
      result,
      measurementMap,
      clockStyle,
      0
    );

    return detailedBodyMeasurements;
  } catch (error) {
    console.log(error);
    return [];
  }
};

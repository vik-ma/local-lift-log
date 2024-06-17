import { MeasurementMap, UserMeasurement } from "../../typings";
import { CreateDetailedUserMeasurementList } from "./CreateDetailedUserMeasurementList";
import Database from "tauri-plugin-sql-api";

export const GetUserMeasurements = async (
  clockStyle: string,
  measurementMap: MeasurementMap
): Promise<UserMeasurement[]> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<UserMeasurement[]>(
      "SELECT * FROM user_measurements ORDER BY id DESC"
    );

    const detailedUserMeasurements = CreateDetailedUserMeasurementList(
      result,
      measurementMap,
      clockStyle
    );

    return detailedUserMeasurements;
  } catch (error) {
    console.log(error);
    return [];
  }
};

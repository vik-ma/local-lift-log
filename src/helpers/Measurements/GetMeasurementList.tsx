import Database from "tauri-plugin-sql-api";
import { Measurement } from "../../typings";

export const GetMeasurementList = async (): Promise<Measurement[]> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: Measurement[] = await db.select("SELECT * FROM measurements");

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};

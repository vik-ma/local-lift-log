import Database from "tauri-plugin-sql-api";
import { DefaultDistanceList } from "..";

export const CreateDefaultDistances = async (isMetric: boolean) => {
  const defaultDistanceList = DefaultDistanceList(isMetric);

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    defaultDistanceList.forEach((distance) => {
      db.execute(
        "INSERT into distances (name, distance, distance_unit) VALUES ($1, $2, $3)",
        [distance.name, distance.distance, distance.distance_unit]
      );
    });
  } catch (error) {
    console.log(error);
  }
};

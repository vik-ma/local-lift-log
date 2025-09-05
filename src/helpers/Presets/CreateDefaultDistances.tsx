import Database from "@tauri-apps/plugin-sql";
import { GetDefaultDistances } from "..";

export const CreateDefaultDistances = async (isMetric: boolean) => {
  const DEFAULT_DISTANCES = GetDefaultDistances(isMetric);

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    DEFAULT_DISTANCES.forEach((distance) => {
      db.execute(
        `INSERT into distances (name, distance, distance_unit, is_favorite) 
         VALUES ($1, $2, $3, $4)`,
        [
          distance.name,
          distance.distance,
          distance.distance_unit,
          distance.is_favorite,
        ]
      );
    });
  } catch (error) {
    console.log(error);
  }
};

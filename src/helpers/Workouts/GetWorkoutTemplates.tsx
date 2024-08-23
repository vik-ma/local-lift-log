import Database from "tauri-plugin-sql-api";
import { WorkoutTemplateListItem } from "../../typings";

export const GetWorkoutTemplates = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<WorkoutTemplateListItem[]>(
      "SELECT id, name FROM workout_templates"
    );

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};

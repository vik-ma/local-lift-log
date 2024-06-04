import { WorkoutTemplate } from "../../typings";
import Database from "tauri-plugin-sql-api";

export const UpdateWorkoutTemplate = async (
  workoutTemplate: WorkoutTemplate
): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE workout_templates SET name = $1, note = $2,
       exercise_order = $3 WHERE id = $4`,
      [
        workoutTemplate.name,
        workoutTemplate.note,
        workoutTemplate.exercise_order,
        workoutTemplate.id,
      ]
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

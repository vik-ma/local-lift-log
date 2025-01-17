import Database from "tauri-plugin-sql-api";

type WorkoutRoutineScheduleColumn = "id" | "routine_id" | "workout_template_id";

export const DeleteWorkoutRoutineSchedule = async (
  id: number,
  column: WorkoutRoutineScheduleColumn
) => {
  if (
    column !== "id" &&
    column !== "routine_id" &&
    column !== "workout_template_id"
  )
    return false;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `DELETE from workout_routine_schedules WHERE ${column} = $1`,
      [id]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

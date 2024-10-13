import Database from "tauri-plugin-sql-api";

export const DeleteWorkoutWithId = async (workoutId: number) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute("DELETE from workouts WHERE id = $1", [workoutId]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

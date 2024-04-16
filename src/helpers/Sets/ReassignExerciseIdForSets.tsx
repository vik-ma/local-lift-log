import Database from "tauri-plugin-sql-api";

export const ReassignExerciseIdForSets = async (
  oldExerciseId: number,
  newExerciseId: number
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute("UPDATE sets SET exercise_id = $1 WHERE exercise_id = $2", [
      newExerciseId,
      oldExerciseId,
    ]);
  } catch (error) {
    console.log(error);
  }
};

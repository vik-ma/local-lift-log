import Database from "tauri-plugin-sql-api";

type ExerciseOrderQuery = {
  exercise_order: string;
};

export const GetExerciseOrder = async (
  id: number,
  isTemplate: boolean
): Promise<string | undefined> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const queryString = isTemplate
      ? `SELECT exercise_order FROM workout_templates 
          WHERE id = $1`
      : `SELECT exercise_order FROM workouts 
          WHERE id = $1`;

    const exerciseOrder = await db.select<ExerciseOrderQuery[]>(queryString, [
      id,
    ]);

    if (exerciseOrder[0].exercise_order === undefined) return undefined;

    return exerciseOrder[0].exercise_order;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

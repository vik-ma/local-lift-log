import { GenerateExerciseOrderString } from "..";
import Database from "tauri-plugin-sql-api";
import { GroupedWorkoutSet } from "../../typings";

type UpdateExerciseOrderReturnType = {
  success: boolean;
  exerciseOrderString: string;
};

export const UpdateExerciseOrder = async (
  setList: GroupedWorkoutSet[],
  id: number,
  isTemplate: boolean
): Promise<UpdateExerciseOrderReturnType> => {
  const exerciseOrderString: string = GenerateExerciseOrderString(setList);

  const executeString: string = isTemplate
    ? `UPDATE workout_templates SET exercise_order = $1 WHERE id = $2`
    : `UPDATE workouts SET exercise_order = $1 WHERE id = $2`;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(executeString, [exerciseOrderString, id]);

    return { success: true, exerciseOrderString };
  } catch (error) {
    console.log(error);
    return { success: false, exerciseOrderString: "" };
  }
};

import Database from "tauri-plugin-sql-api";
import { CalculationListItem, Exercise, PresetsType } from "../../typings";
import { CreateCalculationString } from "./CreateCalculationString";

type UpdateCalculationStringReturnType = {
  success: boolean;
  updatedExercise: Exercise;
};

export const UpdateCalculationString = async (
  calculationList: CalculationListItem[],
  presetsType: PresetsType,
  exercise: Exercise
): Promise<UpdateCalculationStringReturnType> => {
  const calculationString = CreateCalculationString(
    calculationList,
    presetsType
  );

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE exercises 
       SET calculation_string = $1 
       WHERE id = $2`,
      [calculationString, exercise.id]
    );

    const updatedExercise: Exercise = {
      ...exercise,
      calculation_string: calculationString,
    };

    return { success: true, updatedExercise: updatedExercise };
  } catch (error) {
    console.log(error);
    return { success: false, updatedExercise: exercise };
  }
};

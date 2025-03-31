import Database from "tauri-plugin-sql-api";
import { ValidateDefaultLoadExerciseOptionsString } from "./ValidateDefaultLoadExerciseOptionsString";

export const UpdateDefaultLoadExerciseOptions = async (
  defaultLoadExerciseOptionsString: string,
  userSettingsId: number
) => {
  // TODO: ADD PROP FOR ANALYTICS OR EXERCISEDETAILS PAGE

  if (
    !ValidateDefaultLoadExerciseOptionsString(defaultLoadExerciseOptionsString)
  )
    return false;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      "UPDATE user_settings SET load_exercise_options_analytics = $1 WHERE id = $2",
      [defaultLoadExerciseOptionsString, userSettingsId]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

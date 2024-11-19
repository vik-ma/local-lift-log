import Database from "tauri-plugin-sql-api";
import { IsNumberValidBinary } from "..";

export const UpdateShowSecondaryExerciseGroups = async (
  value: number,
  userSettingsId: number
) => {
  if (!IsNumberValidBinary(value)) return;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET show_secondary_exercise_groups = $1 WHERE id = $2",
      [value, userSettingsId]
    );
  } catch (error) {
    console.log(error);
  }
};

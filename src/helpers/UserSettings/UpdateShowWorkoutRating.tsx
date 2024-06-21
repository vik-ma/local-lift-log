import Database from "tauri-plugin-sql-api";
import { UserSettingsOptional } from "../../typings";
import { IsNumberValidBinary } from "../Numbers/IsNumberValidBinary";

export const UpdateShowWorkoutRating = async (
  userSettings: UserSettingsOptional
) => {
  if (
    userSettings.show_workout_rating === undefined ||
    !IsNumberValidBinary(userSettings.show_workout_rating)
  )
    return;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET show_workout_rating = $1 WHERE id = $2",
      [userSettings.show_workout_rating, userSettings.id]
    );
  } catch (error) {
    console.log(error);
  }
};

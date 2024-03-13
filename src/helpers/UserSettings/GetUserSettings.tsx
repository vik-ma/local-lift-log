import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../../typings";
import { ConvertStringToBoolean } from "../Misc/ConvertStringToBoolean";

export const GetUserSettings = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result: UserSettings[] = await db.select(
      "SELECT * FROM user_settings LIMIT 1"
    );

    if (result.length === 1) {
      const userSettings: UserSettings = result[0];
      // Convert boolean values saved as strings
      const convertedBooleanValue = ConvertStringToBoolean(
        userSettings.show_timestamp_on_completed_set
      );
      userSettings.show_timestamp_on_completed_set = convertedBooleanValue;

      return userSettings;
    } else {
      return undefined;
    }
  } catch (error) {
    console.log(error);
  }
};

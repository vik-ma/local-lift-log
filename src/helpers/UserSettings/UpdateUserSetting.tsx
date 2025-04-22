import Database from "tauri-plugin-sql-api";
import { ValidateUserSetting } from "..";
import { UserSettings } from "../../typings";

export const UpdateUserSetting = async <K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K],
  userSettings: UserSettings,
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >
) => {
  if (!ValidateUserSetting(key, value)) return false;

  const updatedUserSettings: UserSettings = {
    ...userSettings,
    [key]: value,
  };

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(`UPDATE user_settings SET ${key} = $1 WHERE id = $2`, [
      value,
      userSettings.id,
    ]);

    setUserSettings(updatedUserSettings);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

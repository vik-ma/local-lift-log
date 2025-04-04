import Database from "tauri-plugin-sql-api";
import { IsNumberValidIdOr0 } from "..";

export const UpdateActiveRoutineId = async (
  activeRoutineId: number,
  userSettingsId: number
) => {
  if (!IsNumberValidIdOr0(activeRoutineId)) return false;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute(
      "UPDATE user_settings SET active_routine_id = $1 WHERE id = $2",
      [activeRoutineId, userSettingsId]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

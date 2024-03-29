import Database from "tauri-plugin-sql-api";
import { UserWeight } from "../../typings";

export const GetLatestUserWeight = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<UserWeight[]>(`
    SELECT * FROM user_weights
    ORDER BY id DESC LIMIT 1`);

    const userWeight: UserWeight = result[0];

    return userWeight;
  } catch (error) {
    console.log(error);
  }
};

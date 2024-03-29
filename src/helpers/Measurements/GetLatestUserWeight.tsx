import Database from "tauri-plugin-sql-api";
import { UserWeight } from "../../typings";
import { FormatDateString } from "..";

export const GetLatestUserWeight = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<UserWeight[]>(`
    SELECT * FROM user_weights
    ORDER BY id DESC LIMIT 1`);

    const userWeight: UserWeight = result[0];

    userWeight.formattedDate = FormatDateString(userWeight.date);

    return userWeight;
  } catch (error) {
    console.log(error);
  }
};

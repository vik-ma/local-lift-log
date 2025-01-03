import Database from "tauri-plugin-sql-api";
import { UserWeight } from "../../typings";
import { FormatDateTimeString } from "..";

export const GetLatestUserWeight = async (clockStyle: string) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<UserWeight[]>(
      `SELECT * FROM user_weights
      ORDER BY date DESC LIMIT 1`
    );

    const userWeight: UserWeight = result[0];

    if (userWeight === undefined) return undefined;

    userWeight.formattedDate = FormatDateTimeString(
      userWeight.date,
      clockStyle === "24h"
    );

    return userWeight;
  } catch (error) {
    console.log(error);
  }
};

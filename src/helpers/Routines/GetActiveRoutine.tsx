import Database from "@tauri-apps/plugin-sql";
import { Routine } from "../../typings";

export const GetActiveRoutine = async (activeRoutineId: number) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<Routine[]>(
      `SELECT * FROM routines WHERE id = $1`,
      [activeRoutineId]
    );

    if (result.length === 0) return undefined;

    const activeRoutine = result[0];

    return activeRoutine;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

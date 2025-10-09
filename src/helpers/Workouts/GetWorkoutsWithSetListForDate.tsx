import Database from "@tauri-apps/plugin-sql";
import { Workout } from "../../typings";

export const GetWorkoutsWithSetListForDate = async (date: Date) => {
  try {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const dateString = date.toISOString();
    const nextDayString = nextDay.toISOString();

    const db = await Database.load(import.meta.env.VITE_DB);

    const workouts = await db.select<Workout[]>(
      `SELECT * FROM workouts
       WHERE datetime(workouts.date) >= datetime('${dateString}')
         AND datetime(workouts.date) < datetime('${nextDayString}')`
    );

    return workouts;
  } catch (error) {
    console.log(error);
    return [];
  }
};

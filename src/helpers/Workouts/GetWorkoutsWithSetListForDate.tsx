import Database from "@tauri-apps/plugin-sql";
import { Workout } from "../../typings";
import { GetTimezoneOffsetString } from "..";

export const GetWorkoutsWithSetListForDate = async (date: Date) => {
  try {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const dateString = date.toISOString();
    const nextDayString = nextDay.toISOString();

    const timezoneOffset = GetTimezoneOffsetString();

    const db = await Database.load(import.meta.env.VITE_DB);

    const workouts = await db.select<Workout[]>(
      `SELECT * FROM workouts
       WHERE datetime(workouts.date, '${timezoneOffset}') >= datetime('${dateString}')
         AND datetime(workouts.date, '${timezoneOffset}') < datetime('${nextDayString}')`
    );

    return workouts;
  } catch (error) {
    console.log(error);
    return [];
  }
};

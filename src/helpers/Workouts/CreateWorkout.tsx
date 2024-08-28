import Database from "tauri-plugin-sql-api";
import { Workout } from "../../typings";
import {
  DefaultNewWorkout,
  GetCurrentYmdDateString,
  IsNumberValidIdOr0,
} from "..";

export const CreateWorkout = async (
  workoutTemplateId: number
): Promise<number> => {
  if (!IsNumberValidIdOr0(workoutTemplateId)) return 0;

  const currentDate: string = GetCurrentYmdDateString();

  const newWorkout: Workout = {
    ...DefaultNewWorkout(),
    workout_template_id: workoutTemplateId,
    date: currentDate,
  };

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into workouts 
      (workout_template_id, date, exercise_order, note, is_loaded, rating) 
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        newWorkout.workout_template_id,
        newWorkout.date,
        newWorkout.exercise_order,
        newWorkout.note,
        newWorkout.is_loaded,
        newWorkout.rating,
      ]
    );

    return result.lastInsertId;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

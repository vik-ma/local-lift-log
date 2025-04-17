import Database from "tauri-plugin-sql-api";
import { Workout } from "../../typings";
import {
  DefaultNewWorkout,
  GetCurrentDateTimeISOString,
  IsNumberValidIdOr0,
} from "..";

export const CreateWorkout = async (
  workoutTemplateId: number
): Promise<Workout | undefined> => {
  if (!IsNumberValidIdOr0(workoutTemplateId)) return undefined;

  const currentDate = GetCurrentDateTimeISOString();

  const newWorkout: Workout = {
    ...DefaultNewWorkout(),
    workout_template_id: workoutTemplateId,
    date: currentDate,
  };

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into workouts 
      (workout_template_id, date, exercise_order, comment, routine_id) 
      VALUES ($1, $2, $3, $4, $5)`,
      [
        newWorkout.workout_template_id,
        newWorkout.date,
        newWorkout.exercise_order,
        newWorkout.comment,
        newWorkout.routine_id,
      ]
    );

    newWorkout.id = result.lastInsertId;

    return newWorkout;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

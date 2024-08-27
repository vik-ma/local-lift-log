import Database from "tauri-plugin-sql-api";
import { useNavigate } from "react-router-dom";
import { GetCurrentYmdDateString, IsNumberValidIdOr0 } from "../helpers";
import { Workout } from "../typings";
import { useDefaultWorkout } from ".";

export const useCreateWorkout = () => {
  const navigate = useNavigate();

  const defaultWorkout = useDefaultWorkout();

  const createWorkout = async (workoutTemplateId: number) => {
    if (!IsNumberValidIdOr0(workoutTemplateId)) return;

    const currentDate: string = GetCurrentYmdDateString();

    const newWorkout: Workout = {
      ...defaultWorkout,
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

      navigate(`/workouts/${result.lastInsertId}`);
    } catch (error) {
      console.log(error);
    }
  };

  return { createWorkout };
};

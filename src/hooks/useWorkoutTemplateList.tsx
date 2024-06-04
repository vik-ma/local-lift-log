import { WorkoutTemplateListItem, Workout } from "../typings";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import { useDefaultWorkout } from "./useDefaultWorkout";
import { GetCurrentYmdDateString } from "../helpers";

export const useWorkoutTemplateList = () => {
  const [workoutTemplates, setWorkoutTemplates] = useState<
    WorkoutTemplateListItem[]
  >([]);

  const navigate = useNavigate();

  const workoutTemplatesModal = useDisclosure();

  const defaultWorkout = useDefaultWorkout();

  useEffect(() => {
    const getWorkoutTemplates = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutTemplateListItem[]>(
          "SELECT id, name FROM workout_templates"
        );

        const templates: WorkoutTemplateListItem[] = result.map((row) => ({
          id: row.id,
          name: row.name,
        }));

        setWorkoutTemplates(templates);
      } catch (error) {
        console.log(error);
      }
    };

    getWorkoutTemplates();
  }, []);

  const createWorkout = async (workout_template_id: number) => {
    const currentDate: string = GetCurrentYmdDateString();

    const newWorkout: Workout = {
      ...defaultWorkout,
      workout_template_id: workout_template_id,
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

  return { workoutTemplatesModal, workoutTemplates, createWorkout };
};

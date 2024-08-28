import { WorkoutTemplate } from "../typings";
import { useState, useEffect } from "react";
import { useDisclosure } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";

export const useWorkoutTemplateList = () => {
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const workoutTemplatesModal = useDisclosure();

  useEffect(() => {
    const getWorkoutTemplates = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        // Get all columns and how many Sets and Exercises every WorkoutTemplate contains
        const result = await db.select<WorkoutTemplate[]>(
          `SELECT workout_templates.*, 
          COUNT(DISTINCT CASE WHEN is_template = 1 THEN sets.exercise_id END) AS numExercises,
          SUM(CASE WHEN is_template = 1 THEN 1 ELSE 0 END) AS numSets
          FROM workout_templates LEFT JOIN sets 
          ON workout_templates.id = sets.workout_template_id 
          GROUP BY workout_templates.id`
        );

        setWorkoutTemplates(result);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getWorkoutTemplates();
  }, []);

  return {
    workoutTemplatesModal,
    workoutTemplates,
    setWorkoutTemplates,
    isLoading,
  };
};

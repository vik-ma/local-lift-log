import { WorkoutTemplate } from "../typings";
import { useState, useEffect, useCallback, useRef } from "react";
import { useDisclosure } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";

export const useWorkoutTemplateList = (
  getWorkoutTemplatesOnLoad: boolean,
  ignoreEmptyWorkoutTemplates?: boolean
) => {
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const workoutTemplateListIsLoaded = useRef(false);

  const workoutTemplatesModal = useDisclosure();

  const getWorkoutTemplates = useCallback(async () => {
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

      const workoutTemplates: WorkoutTemplate[] = [];

      for (const row of result) {
        if (ignoreEmptyWorkoutTemplates && row.numSets === 0) continue;

        const workoutTemplate: WorkoutTemplate = {
          id: row.id,
          name: row.name,
          exercise_order: row.exercise_order,
          note: row.note,
          numSets: row.numSets,
          numExercises: row.numExercises,
        };

        workoutTemplates.push(workoutTemplate);
      }

      setWorkoutTemplates(workoutTemplates);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }, [ignoreEmptyWorkoutTemplates]);

  useEffect(() => {
    if (getWorkoutTemplatesOnLoad) {
      getWorkoutTemplates();
    }
  }, [getWorkoutTemplatesOnLoad, getWorkoutTemplates]);

  const handleOpenWorkoutTemplatesModal = useCallback(async () => {
    if (!workoutTemplateListIsLoaded.current) {
      getWorkoutTemplates();
      workoutTemplateListIsLoaded.current = true;
    }

    workoutTemplatesModal.onOpen();
  }, [workoutTemplatesModal, getWorkoutTemplates]);

  return {
    workoutTemplatesModal,
    workoutTemplates,
    setWorkoutTemplates,
    isLoading,
    handleOpenWorkoutTemplatesModal,
  };
};

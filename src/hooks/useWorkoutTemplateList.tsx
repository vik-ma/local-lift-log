import {
  WorkoutTemplate,
  UseWorkoutTemplateListReturnType,
  WorkoutTemplateSortCategory,
} from "../typings";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDisclosure } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";

export const useWorkoutTemplateList = (
  getWorkoutTemplatesOnLoad: boolean,
  ignoreEmptyWorkoutTemplates?: boolean
): UseWorkoutTemplateListReturnType => {
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<WorkoutTemplateSortCategory>("name");

  const isWorkoutTemplateListLoaded = useRef(false);

  const workoutTemplatesModal = useDisclosure();

  const filteredWorkoutTemplates = useMemo(() => {
    if (filterQuery !== "") {
      return workoutTemplates.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          (item.note !== null &&
            item.note
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()))
      );
    }
    return workoutTemplates;
  }, [workoutTemplates, filterQuery]);

  const getWorkoutTemplates = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get all columns and how many Sets and Exercises every WorkoutTemplate contains
      const result = await db.select<WorkoutTemplate[]>(
        `SELECT 
          workout_templates.*, 
          json_group_array(
            json_object(
              'id', COALESCE(exercises.id, distinct_sets.exercise_id),
              'exercise_group_set_string_primary', exercises.exercise_group_set_string_primary,
              'exercise_group_set_string_secondary', exercises.exercise_group_set_string_secondary
            )
          ) AS exerciseListString,
          (SELECT COUNT(*) 
            FROM sets 
              WHERE sets.workout_template_id = workout_templates.id AND sets.is_template = 1) AS numSets
          FROM 
            workout_templates
          LEFT JOIN 
            (SELECT DISTINCT exercise_id, workout_template_id FROM sets WHERE is_template = 1) AS distinct_sets
            ON workout_templates.id = distinct_sets.workout_template_id
          LEFT JOIN 
            exercises ON distinct_sets.exercise_id = exercises.id
          GROUP BY 
            workout_templates.id`
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

      sortWorkoutTemplatesByName(workoutTemplates);
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
    if (!isWorkoutTemplateListLoaded.current) {
      getWorkoutTemplates();
      isWorkoutTemplateListLoaded.current = true;
    }

    workoutTemplatesModal.onOpen();
  }, [workoutTemplatesModal, getWorkoutTemplates]);

  const sortWorkoutTemplatesByName = (
    workoutTemplateList: WorkoutTemplate[]
  ) => {
    workoutTemplateList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setWorkoutTemplates(workoutTemplateList);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "name") {
      setSortCategory(key);
      sortWorkoutTemplatesByName([...workoutTemplates]);
    }
  };

  return {
    workoutTemplatesModal,
    workoutTemplates,
    setWorkoutTemplates,
    isLoading,
    handleOpenWorkoutTemplatesModal,
    filterQuery,
    setFilterQuery,
    filteredWorkoutTemplates,
    handleSortOptionSelection,
    sortCategory,
  };
};

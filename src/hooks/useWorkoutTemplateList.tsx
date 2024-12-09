import {
  WorkoutTemplate,
  UseWorkoutTemplateListReturnType,
  WorkoutTemplateSortCategory,
  UseExerciseListReturnType,
  WorkoutTemplateMap,
} from "../typings";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDisclosure } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import {
  CreateWorkoutExerciseSets,
  DoesListOrSetHaveCommonElement,
} from "../helpers";
import { useListFilters } from "./useListFilters";

export const useWorkoutTemplateList = (
  getWorkoutTemplatesOnLoad: boolean,
  useExerciseList: UseExerciseListReturnType,
  ignoreEmptyWorkoutTemplates?: boolean,
  ignoreWorkoutTemplateId?: number
): UseWorkoutTemplateListReturnType => {
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<WorkoutTemplateSortCategory>("name");
  const workoutTemplateMap = useRef<WorkoutTemplateMap>(new Map());

  const isWorkoutTemplateListLoaded = useRef(false);

  const workoutTemplatesModal = useDisclosure();

  const {
    exerciseGroupDictionary,
    isExerciseListLoaded,
    getExercises,
    includeSecondaryGroups,
    exerciseMap,
  } = useExerciseList;

  const listFilters = useListFilters(useExerciseList);

  const { filterMap, filterExercises, filterExerciseGroups } = listFilters;

  const filterWorkoutTemplateListModal = useDisclosure();

  const filteredWorkoutTemplates = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return workoutTemplates.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            (item.note !== null &&
              item.note
                .toLocaleLowerCase()
                .includes(filterQuery.toLocaleLowerCase()))) &&
          (!filterMap.has("exercises") ||
            DoesListOrSetHaveCommonElement(
              filterExercises,
              item.exerciseIdSet
            )) &&
          (!filterMap.has("exercise-groups") ||
            (!includeSecondaryGroups &&
              DoesListOrSetHaveCommonElement(
                filterExerciseGroups,
                item.exerciseGroupSetPrimary
              )) ||
            (includeSecondaryGroups &&
              DoesListOrSetHaveCommonElement(
                filterExerciseGroups,
                item.exerciseGroupSetSecondary
              )))
      );
    }
    return workoutTemplates;
  }, [
    workoutTemplates,
    filterQuery,
    filterMap,
    filterExercises,
    filterExerciseGroups,
    includeSecondaryGroups,
  ]);

  const getWorkoutTemplates = useCallback(async () => {
    if (!isExerciseListLoaded.current) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get all columns and how many Sets and Exercises every WorkoutTemplate contains
      const result = await db.select<WorkoutTemplate[]>(
        `SELECT 
          workout_templates.*, 
          json_group_array(
              DISTINCT json_object('id', exercise_id)
          ) AS exerciseListString,
          (SELECT COUNT(*) 
            FROM sets 
            WHERE sets.workout_template_id = workout_templates.id AND sets.is_template = 1) AS numSets
        FROM 
          workout_templates
        LEFT JOIN 
          (SELECT DISTINCT workout_template_id, exercise_id
            FROM sets 
            WHERE is_template = 1) AS distinct_sets
        ON 
          workout_templates.id = distinct_sets.workout_template_id
        GROUP BY 
          workout_templates.id`
      );

      const workoutTemplates: WorkoutTemplate[] = [];
      const newWorkoutTemplateMap: WorkoutTemplateMap = new Map();

      for (const row of result) {
        if (
          row.id === ignoreWorkoutTemplateId ||
          (ignoreEmptyWorkoutTemplates && row.numSets === 0)
        )
          continue;

        const workoutExerciseSets = CreateWorkoutExerciseSets(
          row.exerciseListString,
          exerciseGroupDictionary,
          exerciseMap.current
        );

        const workoutTemplate: WorkoutTemplate = {
          id: row.id,
          name: row.name,
          exercise_order: row.exercise_order,
          note: row.note,
          numSets: row.numSets,
          exerciseIdSet: workoutExerciseSets.exerciseIdSet,
          exerciseGroupSetPrimary: workoutExerciseSets.exerciseGroupSetPrimary,
          exerciseGroupSetSecondary:
            workoutExerciseSets.exerciseGroupSetSecondary,
        };

        workoutTemplates.push(workoutTemplate);
        newWorkoutTemplateMap.set(workoutTemplate.id, workoutTemplate);
      }

      sortWorkoutTemplatesByName(workoutTemplates);
      workoutTemplateMap.current = newWorkoutTemplateMap;
      isWorkoutTemplateListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, [
    ignoreEmptyWorkoutTemplates,
    exerciseGroupDictionary,
    isExerciseListLoaded,
    exerciseMap,
    ignoreWorkoutTemplateId,
  ]);

  const loadWorkoutTemplateList = useCallback(async () => {
    if (!isExerciseListLoaded.current) {
      await getExercises();
    }

    if (!isWorkoutTemplateListLoaded.current) {
      await getWorkoutTemplates();
    }
  }, [
    isExerciseListLoaded,
    isWorkoutTemplateListLoaded,
    getExercises,
    getWorkoutTemplates,
  ]);

  useEffect(() => {
    if (getWorkoutTemplatesOnLoad) {
      loadWorkoutTemplateList();
    }
  }, [getWorkoutTemplatesOnLoad, loadWorkoutTemplateList]);

  const sortWorkoutTemplatesByName = (
    workoutTemplateList: WorkoutTemplate[]
  ) => {
    workoutTemplateList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setWorkoutTemplates(workoutTemplateList);
  };

  const sortWorkoutTemplatesByNumSets = (
    workoutTemplateList: WorkoutTemplate[],
    isAscending: boolean
  ) => {
    workoutTemplateList.sort((a, b) => {
      const aCount = a.numSets !== undefined ? a.numSets : -Infinity;
      const bCount = b.numSets !== undefined ? b.numSets : -Infinity;

      if (bCount !== aCount) {
        const sortKey = isAscending ? aCount - bCount : bCount - aCount;
        return sortKey;
      }

      // Sort names alphabetically if same number of Sets
      return a.name.localeCompare(b.name);
    });

    setWorkoutTemplates(workoutTemplateList);
  };

  const sortWorkoutTemplatesByNumExercises = (
    workoutTemplateList: WorkoutTemplate[],
    isAscending: boolean
  ) => {
    workoutTemplateList.sort((a, b) => {
      const aCount =
        a.exerciseIdSet !== undefined ? a.exerciseIdSet.size : -Infinity;
      const bCount =
        b.exerciseIdSet !== undefined ? b.exerciseIdSet.size : -Infinity;

      if (bCount !== aCount) {
        const sortKey = isAscending ? aCount - bCount : bCount - aCount;
        return sortKey;
      }

      // Sort names alphabetically if same number of Exercises
      return a.name.localeCompare(b.name);
    });

    setWorkoutTemplates(workoutTemplateList);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "name") {
      setSortCategory(key);
      sortWorkoutTemplatesByName([...workoutTemplates]);
    } else if (key === "num-sets-desc") {
      setSortCategory(key);
      sortWorkoutTemplatesByNumSets([...workoutTemplates], false);
    } else if (key === "num-sets-asc") {
      setSortCategory(key);
      sortWorkoutTemplatesByNumSets([...workoutTemplates], true);
    } else if (key === "num-exercises-desc") {
      setSortCategory(key);
      sortWorkoutTemplatesByNumExercises([...workoutTemplates], false);
    } else if (key === "num-exercises-asc") {
      setSortCategory(key);
      sortWorkoutTemplatesByNumExercises([...workoutTemplates], true);
    }
  };

  const handleOpenFilterButton = async () => {
    await loadWorkoutTemplateList();

    filterWorkoutTemplateListModal.onOpen();
  };

  const handleOpenWorkoutTemplateListModal = async () => {
    await loadWorkoutTemplateList();

    workoutTemplatesModal.onOpen();
  };

  return {
    workoutTemplatesModal,
    workoutTemplates,
    setWorkoutTemplates,
    handleOpenWorkoutTemplateListModal,
    filterQuery,
    setFilterQuery,
    filteredWorkoutTemplates,
    handleSortOptionSelection,
    sortCategory,
    filterWorkoutTemplateListModal,
    handleOpenFilterButton,
    listFilters,
    workoutTemplateMap,
    isWorkoutTemplateListLoaded,
    getWorkoutTemplates,
  };
};

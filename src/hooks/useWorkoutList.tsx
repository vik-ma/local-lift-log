import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  UseWorkoutListReturnType,
  Workout,
  WorkoutFilterMapKey,
  WorkoutSortCategory,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import {
  ConvertCalendarDateToLocalizedString,
  CreateWorkoutExerciseMapItem,
  FormatDateString,
  IsDateInWeekdaySet,
  IsDateWithinRange,
  WeekdayMap,
} from "../helpers";
import { CalendarDate, RangeValue, useDisclosure } from "@nextui-org/react";
import { useRoutineList } from "./useRoutineList";

export const useWorkoutList = (
  getWorkoutsOnLoad: boolean,
  ignoreEmptyWorkouts?: boolean,
  ignoreWorkoutId?: number
): UseWorkoutListReturnType => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<WorkoutSortCategory>("date-desc");

  const [filterDateRange, setFilterDateRange] =
    useState<RangeValue<CalendarDate> | null>(null);
  const [filterMap, setFilterMap] = useState<Map<WorkoutFilterMapKey, string>>(
    new Map()
  );
  const [filterRoutines, setFilterRoutines] = useState<Set<number>>(new Set());

  const weekdayMap = useMemo(() => {
    return WeekdayMap();
  }, []);

  const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(
    new Set(weekdayMap.keys())
  );

  const routineList = useRoutineList(true);

  const isWorkoutListLoaded = useRef(false);

  const workoutListModal = useDisclosure();
  const filterWorkoutListModal = useDisclosure();

  const filteredWorkouts = useMemo(() => {
    if (
      filterQuery !== "" ||
      filterDateRange !== null ||
      filterWeekdays.size < 7 ||
      filterRoutines.size > 0
    ) {
      return workouts.filter(
        (item) =>
          (item.formattedDate
            ?.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            item.note
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            item.workoutTemplateName
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            item.routine?.name
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          (filterDateRange === null ||
            IsDateWithinRange(item.date, filterDateRange)) &&
          (filterWeekdays.size === 7 ||
            IsDateInWeekdaySet(item.date, filterWeekdays)) &&
          (filterRoutines.size === 0 || filterRoutines.has(item.routine_id))
      );
    }
    return workouts;
  }, [workouts, filterQuery, filterDateRange, filterWeekdays, filterRoutines]);

  const getWorkouts = useCallback(async () => {
    if (!routineList.isRoutineListLoaded.current) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get all columns for Workout, number of Sets and simplified list of Exercises for every Workout
      // Also get name of Workout Template from workout_template_id
      const resultWorkouts = await db.select<Workout[]>(
        `SELECT 
          workouts.*, 
          workout_templates.name AS workoutTemplateName,
          json_group_array(
            json_object(
              'id', COALESCE(exercises.id, distinct_sets.exercise_id),
              'name', exercises.name,
              'exercise_group_set_string_primary', exercises.exercise_group_set_string_primary
            )
          ) AS exerciseListString,
          (SELECT COUNT(*) 
            FROM sets 
              WHERE sets.workout_id = workouts.id AND sets.is_template = 0) AS numSets
          FROM 
            workouts
          LEFT JOIN 
            (SELECT DISTINCT exercise_id, workout_id FROM sets WHERE is_template = 0) AS distinct_sets
            ON workouts.id = distinct_sets.workout_id
          LEFT JOIN 
            exercises ON distinct_sets.exercise_id = exercises.id
          LEFT JOIN 
            workout_templates ON workouts.workout_template_id = workout_templates.id
          GROUP BY 
            workouts.id;`
      );

      const workouts: Workout[] = [];

      for (const row of resultWorkouts) {
        if (
          row.id === ignoreWorkoutId ||
          (ignoreEmptyWorkouts && row.numSets === 0)
        )
          continue;

        const formattedDate = FormatDateString(row.date);

        const exerciseMap = CreateWorkoutExerciseMapItem(
          row.exerciseListString
        );

        const workout: Workout = {
          id: row.id,
          workout_template_id: row.workout_template_id,
          date: row.date,
          exercise_order: row.exercise_order,
          note: row.note,
          rating_general: row.rating_general,
          rating_energy: row.rating_energy,
          rating_injury: row.rating_injury,
          rating_sleep: row.rating_sleep,
          rating_calories: row.rating_calories,
          rating_fasting: row.rating_fasting,
          rating_time: row.rating_time,
          rating_stress: row.rating_stress,
          routine_id: row.routine_id,
          numSets: row.numSets,
          formattedDate: formattedDate,
          workoutTemplateName: row.workoutTemplateName,
          hasInvalidWorkoutTemplate:
            row.workout_template_id > 0 && row.workoutTemplateName === null,
          routine: routineList.routineMap.get(row.routine_id),
          hasInvalidRoutine:
            row.routine_id !== 0 && !routineList.routineMap.has(row.routine_id),
          exerciseMap: exerciseMap,
        };

        workouts.push(workout);
      }

      sortWorkoutsByDate(workouts, false);
      isWorkoutListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, [
    ignoreEmptyWorkouts,
    ignoreWorkoutId,
    routineList.routineMap,
    routineList.isRoutineListLoaded,
  ]);

  useEffect(() => {
    if (getWorkoutsOnLoad) {
      getWorkouts();
    }
  }, [getWorkoutsOnLoad, getWorkouts]);

  const sortWorkoutsByDate = (workoutList: Workout[], isAscending: boolean) => {
    if (isAscending) {
      workoutList.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      workoutList.sort((a, b) => b.date.localeCompare(a.date));
    }

    setWorkouts(workoutList);
  };

  const handleOpenWorkoutListModal = useCallback(() => {
    if (!isWorkoutListLoaded.current) {
      getWorkouts();
    }

    workoutListModal.onOpen();
  }, [workoutListModal, getWorkouts]);

  const handleSortOptionSelection = (key: string) => {
    if (key === "date-desc") {
      setSortCategory(key);
      sortWorkoutsByDate([...workouts], false);
    } else if (key === "date-asc") {
      setSortCategory(key);
      sortWorkoutsByDate([...workouts], true);
    }
  };

  const handleOpenFilterButton = () => {
    filterWorkoutListModal.onOpen();
  };

  const handleFilterSaveButton = (locale: string) => {
    const updatedFilterMap = new Map<WorkoutFilterMapKey, string>();

    if (filterDateRange !== null) {
      const filterDateRangeString = `${ConvertCalendarDateToLocalizedString(
        filterDateRange.start,
        locale
      )} - ${ConvertCalendarDateToLocalizedString(
        filterDateRange.end,
        locale
      )}`;

      updatedFilterMap.set("dates", filterDateRangeString);
    }

    if (filterWeekdays.size < 7) {
      const filterWeekdaysString = Array.from(filterWeekdays)
        .map((day) => (weekdayMap.get(day) ?? "").substring(0, 3))
        .join(", ");

      updatedFilterMap.set("weekdays", filterWeekdaysString);
    }

    if (filterRoutines.size > 0) {
      const filterRoutinesString = Array.from(filterRoutines)
        .map((id) =>
          routineList.routineMap.has(id)
            ? routineList.routineMap.get(id)!.name
            : ""
        )
        .join(", ");

      updatedFilterMap.set("routines", filterRoutinesString);
    }

    setFilterMap(updatedFilterMap);

    filterWorkoutListModal.onClose();
  };

  const removeFilter = (key: WorkoutFilterMapKey) => {
    if (key === "dates" && filterMap.has("dates")) {
      const updatedFilterMap = new Map(filterMap);
      updatedFilterMap.delete("dates");
      setFilterMap(updatedFilterMap);
      setFilterDateRange(null);
    }

    if (key === "weekdays" && filterMap.has("weekdays")) {
      const updatedFilterMap = new Map(filterMap);
      updatedFilterMap.delete("weekdays");
      setFilterMap(updatedFilterMap);
      setFilterWeekdays(new Set(weekdayMap.keys()));
    }

    if (key === "routines" && filterMap.has("routines")) {
      const updatedFilterMap = new Map(filterMap);
      updatedFilterMap.delete("routines");
      setFilterMap(updatedFilterMap);
      setFilterRoutines(new Set());
    }
  };

  const resetFilter = () => {
    setFilterMap(new Map());
    setFilterDateRange(null);
    setFilterWeekdays(new Set(weekdayMap.keys()));
    setFilterRoutines(new Set());
  };

  const showResetFilterButton = useMemo(() => {
    if (filterMap.size > 0) return true;
    if (filterDateRange !== null) return true;
    if (filterWeekdays.size < 7) return true;
    if (filterRoutines.size > 0) return true;

    return false;
  }, [filterMap, filterDateRange, filterWeekdays, filterRoutines]);

  return {
    workouts,
    setWorkouts,
    getWorkouts,
    handleOpenWorkoutListModal,
    workoutListModal,
    filteredWorkouts,
    filterQuery,
    setFilterQuery,
    sortWorkoutsByDate,
    sortCategory,
    setSortCategory,
    handleSortOptionSelection,
    filterWorkoutListModal,
    handleOpenFilterButton,
    handleFilterSaveButton,
    filterDateRange,
    setFilterDateRange,
    filterMap,
    removeFilter,
    resetFilter,
    showResetFilterButton,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
    filterRoutines,
    setFilterRoutines,
    routineList,
  };
};

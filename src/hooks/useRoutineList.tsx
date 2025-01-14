import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Routine,
  RoutineMap,
  RoutineSortCategory,
  UseFilterMinAndMaxValueInputsArgs,
  UseRoutineListReturnType,
  UseWorkoutTemplateListReturnType,
} from "../typings";
import { useDisclosure } from "@nextui-org/react";
import {
  CreateRoutineWorkoutTemplateList,
  DoesListOrSetHaveCommonElement,
  FormatRoutineScheduleTypeString,
  IsNumberWithinLimit,
} from "../helpers";
import { useListFilters } from "./useListFilters";
import Database from "tauri-plugin-sql-api";

export const useRoutineList = (
  getRoutinesOnLoad: boolean,
  useWorkoutTemplateList: UseWorkoutTemplateListReturnType
): UseRoutineListReturnType => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] = useState<RoutineSortCategory>("name");
  const routineMap = useRef<RoutineMap>(new Map());

  const isRoutineListLoaded = useRef(false);

  const routineListModal = useDisclosure();
  const filterRoutineListModal = useDisclosure();

  const {
    isWorkoutTemplateListLoaded,
    workoutTemplateMap,
    getWorkoutTemplates,
  } = useWorkoutTemplateList;

  const filterMinAndMaxValueInputsArgs: UseFilterMinAndMaxValueInputsArgs = {
    minValue: 2,
    maxValue: 14,
    isIntegerOnly: true,
  };

  const listFilters = useListFilters(
    undefined,
    undefined,
    undefined,
    workoutTemplateMap.current,
    filterMinAndMaxValueInputsArgs
  );

  const {
    filterMap,
    filterWorkoutTemplates,
    filterScheduleTypes,
    filterMinNumScheduleDays,
    filterMaxNumScheduleDays,
  } = listFilters;

  const filteredRoutines = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return routines.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            FormatRoutineScheduleTypeString(
              item.schedule_type,
              item.num_days_in_schedule
            )
              .toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          (!filterMap.has("workout-templates") ||
            DoesListOrSetHaveCommonElement(
              filterWorkoutTemplates,
              item.workoutTemplateIdSet
            )) &&
          // (!filterMap.has("schedule-type") ||
          //   IsRoutineScheduleTypeFiltered(
          //     item.is_schedule_weekly,
          //     filterScheduleTypes
          //   )) &&
          (!filterMap.has("min-num-schedule-days") ||
            IsNumberWithinLimit(
              item.num_days_in_schedule,
              filterMinNumScheduleDays,
              false
            )) &&
          (!filterMap.has("max-num-schedule-days") ||
            IsNumberWithinLimit(
              item.num_days_in_schedule,
              filterMaxNumScheduleDays,
              true
            ))
      );
    }
    return routines;
  }, [
    routines,
    filterQuery,
    filterMap,
    filterWorkoutTemplates,
    filterScheduleTypes,
    filterMinNumScheduleDays,
    filterMaxNumScheduleDays,
  ]);

  const getRoutines = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get all columns and number of workout_routine_schedule entries for every Routine
      const result = await db.select<Routine[]>(
        `SELECT routines.*,
         json_group_array(workout_routine_schedules.workout_template_id) AS workoutTemplateIds
         FROM routines
         LEFT JOIN workout_routine_schedules
         ON routines.id = workout_routine_schedules.routine_id
         GROUP BY routines.id`
      );

      const routines: Routine[] = [];
      const newRoutineMap = new Map<number, Routine>();

      for (const row of result) {
        const { workoutTemplateIdList, workoutTemplateIdSet } =
          CreateRoutineWorkoutTemplateList(row.workoutTemplateIds);

        const routine: Routine = {
          ...row,
          workoutTemplateIdList,
          workoutTemplateIdSet,
        };

        newRoutineMap.set(routine.id, routine);
        routines.push(routine);
      }

      sortRoutinesByName(routines);
      routineMap.current = newRoutineMap;
      isRoutineListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (getRoutinesOnLoad) {
      getRoutines();
    }
  }, [getRoutinesOnLoad, getRoutines]);

  const sortRoutinesByName = (routineList: Routine[]) => {
    routineList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setRoutines(routineList);
  };

  const sortRoutinesByNumWorkouts = (
    routineList: Routine[],
    isAscending: boolean
  ) => {
    routineList.sort((a, b) => {
      const aCount =
        a.workoutTemplateIdList !== undefined
          ? a.workoutTemplateIdList.length
          : -Infinity;
      const bCount =
        b.workoutTemplateIdList !== undefined
          ? b.workoutTemplateIdList.length
          : -Infinity;

      if (bCount !== aCount) {
        const sortKey = isAscending ? aCount - bCount : bCount - aCount;
        return sortKey;
      }

      // Sort names alphabetically if same number of Workouts
      return a.name.localeCompare(b.name);
    });

    setRoutines(routineList);
  };

  const sortRoutinesByNumDays = (
    routineList: Routine[],
    isAscending: boolean
  ) => {
    routineList.sort((a, b) => {
      const aCount = a.num_days_in_schedule;
      const bCount = b.num_days_in_schedule;

      if (bCount !== aCount) {
        const sortKey = isAscending ? aCount - bCount : bCount - aCount;
        return sortKey;
      }

      // Sort names alphabetically if same number of Days
      return a.name.localeCompare(b.name);
    });

    setRoutines(routineList);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "name") {
      setSortCategory(key);
      sortRoutinesByName([...routines]);
    } else if (key === "num-workouts-desc") {
      setSortCategory(key);
      sortRoutinesByNumWorkouts([...routines], false);
    } else if (key === "num-workouts-asc") {
      setSortCategory(key);
      sortRoutinesByNumWorkouts([...routines], true);
    } else if (key === "num-days-desc") {
      setSortCategory(key);
      sortRoutinesByNumDays([...routines], false);
    } else if (key === "num-days-asc") {
      setSortCategory(key);
      sortRoutinesByNumDays([...routines], true);
    }
  };

  const sortRoutinesByActiveCategory = (routineList: Routine[]) => {
    switch (sortCategory) {
      case "name":
        sortRoutinesByName(routineList);
        break;
      case "num-workouts-desc":
        sortRoutinesByNumWorkouts([...routines], false);
        break;
      case "num-workouts-asc":
        sortRoutinesByNumWorkouts([...routines], true);
        break;
      case "num-days-desc":
        sortRoutinesByNumDays([...routines], false);
        break;
      case "num-days-asc":
        sortRoutinesByNumDays([...routines], true);
        break;
      default:
        break;
    }
  };

  const loadRoutineList = async () => {
    if (!isWorkoutTemplateListLoaded.current) {
      await getWorkoutTemplates();
    }

    if (!isRoutineListLoaded.current) {
      await getRoutines();
    }
  };

  const handleOpenRoutineListModal = async () => {
    await loadRoutineList();

    routineListModal.onOpen();
  };

  const handleOpenFilterButton = async () => {
    await loadRoutineList();

    filterRoutineListModal.onOpen();
  };

  return {
    routines,
    setRoutines,
    filteredRoutines,
    filterQuery,
    setFilterQuery,
    routineListModal,
    handleOpenRoutineListModal,
    routineMap,
    isRoutineListLoaded,
    sortCategory,
    handleSortOptionSelection,
    getRoutines,
    listFilters,
    filterRoutineListModal,
    handleOpenFilterButton,
    sortRoutinesByActiveCategory,
  };
};

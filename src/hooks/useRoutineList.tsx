import { useMemo, useRef, useState } from "react";
import {
  Routine,
  RoutineMap,
  RoutineSortCategory,
  StoreRef,
  UseFilterMinAndMaxValueInputsArgs,
  UseRoutineListReturnType,
  UseWorkoutTemplateListReturnType,
  WorkoutTemplateSortCategory,
} from "../typings";
import { useDisclosure } from "@heroui/react";
import {
  CreateRoutineWorkoutTemplateList,
  DoesListOrSetHaveCommonElement,
  FormatRoutineScheduleTypeString,
  GetSortCategory,
  GetValidatedNumDaysInSchedule,
  GetValidatedRoutineScheduleType,
  GetValidatedStartDay,
  IsNumberWithinLimit,
  IsRoutineScheduleTypeFiltered,
} from "../helpers";
import Database from "@tauri-apps/plugin-sql";
import { useListFilters } from ".";

export const useRoutineList = (
  store: StoreRef,
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

  const listFilters = useListFilters({
    workoutTemplateMap: workoutTemplateMap.current,
    useFilterMinAndMaxValueInputsArgs: filterMinAndMaxValueInputsArgs,
  });

  const {
    filterMap,
    filterWorkoutTemplates,
    filterScheduleTypes,
    filterMinNumScheduleDays,
    filterMaxNumScheduleDays,
    includeNullInMaxValues,
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
          (!filterMap.has("schedule-type") ||
            IsRoutineScheduleTypeFiltered(
              item.schedule_type,
              filterScheduleTypes
            )) &&
          (!filterMap.has("min-num-schedule-days") ||
            (item.schedule_type !== 2 &&
              IsNumberWithinLimit(
                item.num_days_in_schedule,
                filterMinNumScheduleDays,
                false
              ))) &&
          (!filterMap.has("max-num-schedule-days") ||
            (item.schedule_type === 2 && includeNullInMaxValues) ||
            (item.schedule_type !== 2 &&
              IsNumberWithinLimit(
                item.num_days_in_schedule,
                filterMaxNumScheduleDays,
                true
              )))
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
    includeNullInMaxValues,
  ]);

  const getRoutines = async (category: RoutineSortCategory) => {
    if (!isWorkoutTemplateListLoaded.current) return;

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
        row.schedule_type = GetValidatedRoutineScheduleType(row.schedule_type);
        row.num_days_in_schedule = GetValidatedNumDaysInSchedule(
          row.num_days_in_schedule
        );
        row.start_day = GetValidatedStartDay(row.start_day);

        const { workoutTemplateIdList, workoutTemplateIdSet } =
          CreateRoutineWorkoutTemplateList(
            row.schedule_type === 2
              ? `[${row.workout_template_order}]`
              : row.workoutTemplateIds,
            workoutTemplateMap.current
          );

        const routine: Routine = {
          ...row,
          workoutTemplateIdList,
          workoutTemplateIdSet,
        };

        newRoutineMap.set(routine.id, routine);
        routines.push(routine);
      }

      await sortRoutinesByActiveCategory(routines, category);
      routineMap.current = newRoutineMap;
      isRoutineListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  };

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

  const handleSortOptionSelection = async (key: string) => {
    if (store.current === null) return;

    await store.current.set("sort-category-routines", { value: key });

    await sortRoutinesByActiveCategory(
      [...routines],
      key as RoutineSortCategory
    );
  };

  const sortRoutinesByActiveCategory = async (
    routineList: Routine[],
    newCategory?: RoutineSortCategory
  ) => {
    if (store.current === null) return;

    if (newCategory !== undefined) {
      setSortCategory(newCategory);
    }

    const activeCategory = newCategory ?? sortCategory;

    switch (activeCategory) {
      case "name":
        sortRoutinesByName([...routineList]);
        break;
      case "num-workouts-desc":
        sortRoutinesByNumWorkouts([...routineList], false);
        break;
      case "num-workouts-asc":
        sortRoutinesByNumWorkouts([...routineList], true);
        break;
      case "num-days-desc":
        sortRoutinesByNumDays([...routineList], false);
        break;
      case "num-days-asc":
        sortRoutinesByNumDays([...routineList], true);
        break;
      default:
        // Overwrite invalid categories
        setSortCategory("name");
        await store.current.set("sort-category-routines", {
          value: "name",
        });
        sortRoutinesByName([...routineList]);
        break;
    }
  };

  const loadRoutineList = async () => {
    if (!isWorkoutTemplateListLoaded.current) {
      const workoutTemplateSortCategory = await GetSortCategory(
        store,
        "name" as WorkoutTemplateSortCategory,
        "workout-templates"
      );

      await getWorkoutTemplates(workoutTemplateSortCategory);
    }

    if (!isRoutineListLoaded.current) {
      const routineSortCategory = await GetSortCategory(
        store,
        "name" as RoutineSortCategory,
        "routines"
      );

      await getRoutines(routineSortCategory);
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
    loadRoutineList,
  };
};

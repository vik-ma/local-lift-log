import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Routine,
  RoutineMap,
  RoutineSortCategory,
  UseRoutineListReturnType,
} from "../typings";
import { useDisclosure } from "@nextui-org/react";
import { GetAllRoutinesWithNumWorkoutTemplates } from "../helpers";

export const useRoutineList = (
  getRoutinesOnLoad: boolean
): UseRoutineListReturnType => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [routineMap, setRoutineMap] = useState<RoutineMap>(new Map());
  const [sortCategory, setSortCategory] = useState<RoutineSortCategory>("name");

  const isRoutineListLoaded = useRef(false);

  const routineListModal = useDisclosure();

  const filteredRoutines = useMemo(() => {
    if (filterQuery !== "") {
      return routines.filter((item) =>
        item.name.toLocaleLowerCase().includes(filterQuery.toLocaleLowerCase())
      );
    }
    return routines;
  }, [routines, filterQuery]);

  const getRoutines = useCallback(async () => {
    const routines = await GetAllRoutinesWithNumWorkoutTemplates();

    const routineMap = new Map<number, Routine>(
      routines.map((obj) => [obj.id, obj])
    );

    sortRoutinesByName(routines);
    setRoutineMap(routineMap);
    isRoutineListLoaded.current = true;
  }, []);

  useEffect(() => {
    if (getRoutinesOnLoad) {
      getRoutines();
    }
  }, [getRoutinesOnLoad, getRoutines]);

  const handleOpenRoutineListModal = useCallback(() => {
    if (!isRoutineListLoaded.current) {
      getRoutines();
    }

    routineListModal.onOpen();
  }, [routineListModal, getRoutines]);

  const sortRoutinesByName = (routineList: Routine[]) => {
    routineList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setRoutines(routineList);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "name") {
      setSortCategory(key);
      sortRoutinesByName([...routines]);
    }
    // else if (key === "num-workouts-desc") {
    //   setSortCategory(key);
    //   sortRoutinesByNumWorkouts([...routines], false);
    // } else if (key === "num-workouts-asc") {
    //   setSortCategory(key);
    //   sortRoutinesByNumWorkouts([...routines], true);
    // } else if (key === "num-days-desc") {
    //   setSortCategory(key);
    //   sortRoutinesByNumDays([...routines], false);
    // } else if (key === "num-days-asc") {
    //   setSortCategory(key);
    //   sortRoutinesByNumDays([...routines], true);
    // }
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
  };
};

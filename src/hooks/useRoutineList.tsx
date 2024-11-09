import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Routine, UseRoutineListReturnType } from "../typings";
import Database from "tauri-plugin-sql-api";
import { useDisclosure } from "@nextui-org/react";

export const useRoutineList = (
  getRoutinesOnLoad: boolean
): UseRoutineListReturnType => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const routineListIsLoaded = useRef(false);

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
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      // Get all columns and number of workout_routine_schedule entries for every Routine
      const result = await db.select<Routine[]>(
        `SELECT routines.*, 
        COUNT(workout_routine_schedules.routine_id) AS numWorkoutTemplates 
        FROM routines LEFT JOIN workout_routine_schedules
        ON routines.id = workout_routine_schedules.routine_id 
        GROUP BY routines.id`
      );

      setRoutines(result);
      routineListIsLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (getRoutinesOnLoad) {
      getRoutines();
    }
  }, [getRoutinesOnLoad, getRoutines]);

  const handleOpenRoutineListModal = useCallback(() => {
    if (!routineListIsLoaded.current) {
      getRoutines();
    }

    routineListModal.onOpen();
  }, [routineListModal, getRoutines]);

  return {
    routines,
    setRoutines,
    filteredRoutines,
    filterQuery,
    setFilterQuery,
    routineListModal,
    handleOpenRoutineListModal,
  };
};

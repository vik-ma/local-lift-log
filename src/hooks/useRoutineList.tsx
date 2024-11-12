import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Routine, UseRoutineListReturnType } from "../typings";
import { useDisclosure } from "@nextui-org/react";
import { GetAllRoutinesWithNumWorkoutTemplates } from "../helpers";

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
    const routines = await GetAllRoutinesWithNumWorkoutTemplates();

    setRoutines(routines);
    routineListIsLoaded.current = true;
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

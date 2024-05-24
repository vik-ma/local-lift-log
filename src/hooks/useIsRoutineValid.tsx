import { useMemo } from "react";
import useValidateName from "./useValidateName";
import { Routine } from "../typings";

export const useIsRoutineValid = (routine: Routine) => {
  const isRoutineNameValid = useValidateName(routine.name);

  const isRoutineValid = useMemo(() => {
    if (!isRoutineNameValid) return false;

    if (routine.is_schedule_weekly && routine.num_days_in_schedule !== 7)
      return false;

    if (routine.num_days_in_schedule < 2 || routine.num_days_in_schedule > 14)
      return false;

    return true;
  }, [routine, isRoutineNameValid]);

  return { isRoutineNameValid, isRoutineValid };
};

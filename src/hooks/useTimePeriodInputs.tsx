import { useMemo } from "react";
import { useValidateName } from ".";
import { TimePeriod, UseTimePeriodInputsReturnType } from "../typings";

export const useTimePeriodInputs = (
  timePeriod: TimePeriod
): UseTimePeriodInputsReturnType => {
  const isTimePeriodNameValid = useValidateName(timePeriod.name);

  const isStartDateValid = useMemo(() => {
    return timePeriod.start_date !== null;
  }, [timePeriod.start_date]);

  const isTimePeriodValid = useMemo(() => {
    if (!isTimePeriodNameValid) return false;
    if (!isStartDateValid) return false;
    // TODO: ADD ISENDDATEVALID
    return true;
  }, [isTimePeriodNameValid, isStartDateValid]);

  // TODO: ADD ISENDDATEVALID

  return { isTimePeriodValid, isTimePeriodNameValid, isStartDateValid };
};

import { useMemo } from "react";
import { useValidateName } from ".";
import { TimePeriod, UseIsTimePeriodValidReturnType } from "../typings";

export const useIsTimePeriodValid = (
  timePeriod: TimePeriod
): UseIsTimePeriodValidReturnType => {
  const isTimePeriodNameValid = useValidateName(timePeriod.name);

  const isStartDateValid = useMemo(() => {
    return timePeriod.start_date !== null;
  }, [timePeriod.start_date]);

  // TODO: ADD ISENDDATEVALID

  return { isTimePeriodNameValid, isStartDateValid };
};

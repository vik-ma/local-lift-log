import { useMemo, useState } from "react";
import { useValidateName } from ".";
import { TimePeriod, UseTimePeriodInputsReturnType } from "../typings";
import { CalendarDate } from "@internationalized/date";
import { IsEndDateBeforeStartDate, ParseDateString } from "../helpers";

export const useTimePeriodInputs = (
  timePeriod: TimePeriod
): UseTimePeriodInputsReturnType => {
  const [startDate, setStartDate] = useState<CalendarDate | null>(
    ParseDateString(timePeriod.start_date)
  );
  const [endDate, setEndDate] = useState<CalendarDate | null>(
    ParseDateString(timePeriod.end_date)
  );

  const isTimePeriodNameValid = useValidateName(timePeriod.name);

  const isStartDateValid = useMemo(() => {
    return startDate !== null;
  }, [startDate]);

  const isEndDateValid = useMemo(() => {
    if (startDate === null || endDate === null) return true;

    return !IsEndDateBeforeStartDate(startDate, endDate);
  }, [startDate, endDate]);

  const isTimePeriodValid = useMemo(() => {
    if (!isTimePeriodNameValid) return false;
    if (!isStartDateValid) return false;
    if (!isEndDateValid) return false;
    return true;
  }, [isTimePeriodNameValid, isStartDateValid, isEndDateValid]);

  return {
    isTimePeriodValid,
    isTimePeriodNameValid,
    isStartDateValid,
    isEndDateValid,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  };
};

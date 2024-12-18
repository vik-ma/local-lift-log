import { useMemo, useState } from "react";
import { useValidateName } from ".";
import { TimePeriod, UseTimePeriodInputsReturnType } from "../typings";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import {
  IsEndDateBeforeStartDate,
  ConvertDateStringToCalendarDate,
} from "../helpers";

export const useTimePeriodInputs = (
  timePeriod: TimePeriod
): UseTimePeriodInputsReturnType => {
  const [startDate, setStartDate] = useState<CalendarDate | null>(
    ConvertDateStringToCalendarDate(timePeriod.start_date)
  );
  const [endDate, setEndDate] = useState<CalendarDate | null>(
    ConvertDateStringToCalendarDate(timePeriod.end_date)
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

  const startDateString: string | null = useMemo(() => {
    if (startDate === null) return null;

    const startDateDate = startDate.toDate(getLocalTimeZone());

    return startDateDate.toISOString();
  }, [startDate]);

  const endDateString: string | null = useMemo(() => {
    if (endDate === null) return null;

    const endDateDate = endDate.toDate(getLocalTimeZone());
    endDateDate.setHours(23, 59, 59, 999);

    return endDateDate.toISOString();
  }, [endDate]);

  return {
    isTimePeriodValid,
    isTimePeriodNameValid,
    isStartDateValid,
    isEndDateValid,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startDateString,
    endDateString,
  };
};

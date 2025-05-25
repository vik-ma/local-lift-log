import { CalendarDate } from "@internationalized/date";
import { useMemo } from "react";
import { IsDateBeforeEpochDate } from "../helpers";

export const useIsDateBeforeEpochDate = (date: CalendarDate | null) => {
  const isDateBeforeEpochDate = useMemo(() => {
    return IsDateBeforeEpochDate(date);
  }, [date]);

  return isDateBeforeEpochDate;
};

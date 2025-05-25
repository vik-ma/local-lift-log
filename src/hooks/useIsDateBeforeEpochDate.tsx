import { CalendarDate } from "@internationalized/date";
import { useMemo } from "react";

export const useIsDateBeforeEpochDate = (date: CalendarDate | null) => {
  const isDateBeforeEpochDate = useMemo(() => {
    if (date === null) return false;

    const epochDate = new CalendarDate(1970, 1, 1);

    if (date.compare(epochDate) < 0) return true;

    return false;
  }, [date]);

  return isDateBeforeEpochDate;
};

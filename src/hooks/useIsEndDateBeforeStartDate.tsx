import { CalendarDate } from "@nextui-org/react";
import { useMemo } from "react";

export const useIsEndDateBeforeStartDate = (
  startDate: CalendarDate | null,
  endDate: CalendarDate | null
) => {
  const isEndDateBeforeStartDate = useMemo(() => {
    if (startDate === null || endDate === null) return false;

    try {
      return endDate.compare(startDate) < 0;
    } catch {
      return true;
    }
  }, [startDate, endDate]);

  return isEndDateBeforeStartDate;
};

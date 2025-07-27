import { CalendarDate } from "@heroui/react";
import { useMemo } from "react";

type UseIsEndDateBeforeStartDateProps = {
  startDate: CalendarDate | null;
  endDate: CalendarDate | null;
};

export const useIsEndDateBeforeStartDate = ({
  startDate,
  endDate,
}: UseIsEndDateBeforeStartDateProps) => {
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

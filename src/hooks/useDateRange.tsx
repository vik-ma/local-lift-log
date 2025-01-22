import { CalendarDate } from "@nextui-org/react";
import { useMemo, useState } from "react";
import { useIsEndDateBeforeStartDate } from ".";
import { UseDateRangeReturnType } from "../typings";

export const useDateRange = (): UseDateRangeReturnType => {
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);

  const isEndDateBeforeStartDate = useIsEndDateBeforeStartDate(
    startDate,
    endDate
  );

  const isDateRangeInvalid = useMemo(() => {
    if (startDate === null || endDate === null) return true;
    if (isEndDateBeforeStartDate) return true;
    return false;
  }, [startDate, endDate, isEndDateBeforeStartDate]);

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isEndDateBeforeStartDate,
    isDateRangeInvalid,
  };
};

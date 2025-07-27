import { CalendarDate } from "@heroui/react";
import { useMemo, useState } from "react";
import { useIsDateBeforeEpochDate, useIsEndDateBeforeStartDate } from ".";
import { UseDateRangeReturnType } from "../typings";

export const useDateRange = (): UseDateRangeReturnType => {
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);

  const isEndDateBeforeStartDate = useIsEndDateBeforeStartDate({
    startDate,
    endDate,
  });

  const isStartDateBeforeEpoch = useIsDateBeforeEpochDate(startDate);
  const isEndDateBeforeEpoch = useIsDateBeforeEpochDate(endDate);

  const isDateRangeInvalid = useMemo(() => {
    if (startDate === null || endDate === null) return true;
    if (isStartDateBeforeEpoch || isEndDateBeforeEpoch) return false;
    if (isEndDateBeforeStartDate) return true;
    return false;
  }, [
    startDate,
    endDate,
    isEndDateBeforeStartDate,
    isStartDateBeforeEpoch,
    isEndDateBeforeEpoch,
  ]);

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isEndDateBeforeStartDate,
    isDateRangeInvalid,
    isStartDateBeforeEpoch,
    isEndDateBeforeEpoch,
  };
};

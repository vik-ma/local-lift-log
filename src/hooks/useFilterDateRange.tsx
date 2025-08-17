import { CalendarDate } from "@internationalized/date";
import { UseFilterDateRangeReturnType } from "../typings";
import { useMemo, useState } from "react";
import { useIsEndDateBeforeStartDate } from ".";

export const useFilterDateRange = (): UseFilterDateRangeReturnType => {
  const [filterMinDate, setFilterMinDate] = useState<CalendarDate | null>(null);
  const [filterMaxDate, setFilterMaxDate] = useState<CalendarDate | null>(null);

  const isMaxDateBeforeMinDate = useIsEndDateBeforeStartDate({
    startDate: filterMinDate,
    endDate: filterMaxDate,
  });

  const areDateFiltersEmpty = useMemo(() => {
    if (filterMinDate !== null) return false;
    if (filterMaxDate !== null) return false;
    return true;
  }, [filterMinDate, filterMaxDate]);

  return {
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    isMaxDateBeforeMinDate,
    areDateFiltersEmpty,
  };
};

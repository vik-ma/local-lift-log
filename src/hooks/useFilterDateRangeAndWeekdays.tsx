import { useState } from "react";
import { useIsEndDateBeforeStartDate } from ".";
import { CalendarDate } from "@internationalized/date";
import { UseFilterDateRangeAndWeekdaysReturnType } from "../typings";

export const useFilterDateRangeAndWeekdays =
  (): UseFilterDateRangeAndWeekdaysReturnType => {
    const [filterMinDate, setFilterMinDate] = useState<CalendarDate | null>(
      null
    );
    const [filterMaxDate, setFilterMaxDate] = useState<CalendarDate | null>(
      null
    );

    const isMaxDateBeforeMinDate = useIsEndDateBeforeStartDate({
      startDate: filterMinDate,
      endDate: filterMaxDate,
    });

    return {
      filterMinDate,
      setFilterMinDate,
      filterMaxDate,
      setFilterMaxDate,
      isMaxDateBeforeMinDate,
    };
  };

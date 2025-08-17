import { useMemo, useState } from "react";
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
    const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(
      new Set()
    );

    const isMaxDateBeforeMinDate = useIsEndDateBeforeStartDate({
      startDate: filterMinDate,
      endDate: filterMaxDate,
    });

    const areDateRangeAndWeekdaysFiltersEmpty = useMemo(() => {
      if (filterMinDate !== null) return false;
      if (filterMaxDate !== null) return false;
      if (filterWeekdays.size > 0) return false;
      return true;
    }, [filterMinDate, filterMaxDate, filterWeekdays]);

    return {
      filterMinDate,
      setFilterMinDate,
      filterMaxDate,
      setFilterMaxDate,
      isMaxDateBeforeMinDate,
      filterWeekdays,
      setFilterWeekdays,
      areDateRangeAndWeekdaysFiltersEmpty,
    };
  };

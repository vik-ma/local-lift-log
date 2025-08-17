import { useMemo, useState } from "react";
import { useFilterDateRange } from ".";
import { UseFilterDateRangeAndWeekdaysReturnType } from "../typings";

export const useFilterDateRangeAndWeekdays =
  (): UseFilterDateRangeAndWeekdaysReturnType => {
    const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(
      new Set()
    );

    const {
      filterMinDate,
      setFilterMinDate,
      filterMaxDate,
      setFilterMaxDate,
      isMaxDateBeforeMinDate,
      areDateFiltersEmpty,
    } = useFilterDateRange();

    const areDateRangeAndWeekdaysFiltersEmpty = useMemo(() => {
      if (!areDateFiltersEmpty) return false;
      if (filterWeekdays.size > 0) return false;
      return true;
    }, [filterWeekdays, areDateFiltersEmpty]);

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

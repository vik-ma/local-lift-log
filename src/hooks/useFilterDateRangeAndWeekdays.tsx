import { useMemo, useState } from "react";
import { useFilterDateRange } from ".";
import { UseFilterDateRangeAndWeekdaysReturnType } from "../typings";

export const useFilterDateRangeAndWeekdays =
  (): UseFilterDateRangeAndWeekdaysReturnType => {
    const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(
      new Set()
    );

    const filterDateRange = useFilterDateRange();

    const { areDateFiltersEmpty } = filterDateRange;

    const areDateRangeAndWeekdaysFiltersEmpty = useMemo(() => {
      if (!areDateFiltersEmpty) return false;
      if (filterWeekdays.size > 0) return false;
      return true;
    }, [filterWeekdays, areDateFiltersEmpty]);

    return {
      filterDateRange,
      filterWeekdays,
      setFilterWeekdays,
      areDateRangeAndWeekdaysFiltersEmpty,
    };
  };

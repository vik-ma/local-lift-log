import { useMemo, useState } from "react";
import {
  DietLogListFilterMapKey,
  UseDietLogListFiltersReturnType,
  UseDisclosureReturnType,
} from "../typings";
import { CalendarDate } from "@nextui-org/react";
import { useIsEndDateBeforeStartDate, useWeekdayMap } from ".";

export const useDietLogListFilters = (): UseDietLogListFiltersReturnType => {
  const [filterMap, setFilterMap] = useState<
    Map<DietLogListFilterMapKey, string>
  >(new Map());
  const [filterMinDate, setFilterMinDate] = useState<CalendarDate | null>(null);
  const [filterMaxDate, setFilterMaxDate] = useState<CalendarDate | null>(null);
  const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(new Set());
  const [filterMinCalories, setFilterMinCalories] = useState<number | null>(
    null
  );
  const [filterMaxCalories, setFilterMaxCalories] = useState<number | null>(
    null
  );
  const [filterMinFat, setFilterMinFat] = useState<number | null>(null);
  const [filterMaxFat, setFilterMaxFat] = useState<number | null>(null);
  const [filterMinCarbs, setFilterMinCarbs] = useState<number | null>(null);
  const [filterMaxCarbs, setFilterMaxCarbs] = useState<number | null>(null);
  const [filterMinProtein, setFilterMinProtein] = useState<number | null>(null);
  const [filterMaxProtein, setFilterMaxProtein] = useState<number | null>(null);

  const isMaxDateBeforeMinDate = useIsEndDateBeforeStartDate(
    filterMinDate,
    filterMaxDate
  );

  const weekdayMap = useWeekdayMap();

  const handleFilterSaveButton = (activeModal: UseDisclosureReturnType) => {
    const updatedFilterMap = new Map<DietLogListFilterMapKey, string>();

    // TODO: FIX
    // if (filterMinDate !== null) {
    //   const filterMinDateString = ConvertCalendarDateToLocalizedString(
    //     filterMinDate,
    //     locale
    //   );

    //   updatedFilterMap.set("min-date", filterMinDateString);
    // }

    // if (filterMaxDate !== null) {
    //   const filterMaxDateString = ConvertCalendarDateToLocalizedString(
    //     filterMaxDate,
    //     locale
    //   );

    //   updatedFilterMap.set("max-date", filterMaxDateString);
    // }

    if (filterWeekdays.size > 0) {
      const filterWeekdaysString = Array.from(filterWeekdays)
        .map((day) => (weekdayMap.get(day) ?? "").substring(0, 3))
        .join(", ");

      updatedFilterMap.set("weekdays", filterWeekdaysString);
    }

    setFilterMap(updatedFilterMap);

    activeModal.onClose();
  };

  const removeFilter = (key: string) => {
    const updatedFilterMap = new Map(filterMap);

    if (key === "min-date" && filterMap.has("min-date")) {
      updatedFilterMap.delete("min-date");
      setFilterMinDate(null);
    }

    if (key === "max-date" && filterMap.has("max-date")) {
      updatedFilterMap.delete("max-date");
      setFilterMaxDate(null);
    }

    if (key === "weekdays" && filterMap.has("weekdays")) {
      updatedFilterMap.delete("weekdays");
      setFilterWeekdays(new Set());
    }

    setFilterMap(updatedFilterMap);
  };

  const resetFilter = () => {
    setFilterMap(new Map());
    setFilterMinDate(null);
    setFilterMaxDate(null);
    setFilterWeekdays(new Set());
  };

  const showResetFilterButton = useMemo(() => {
    if (filterMap.size > 0) return true;
    if (filterMinDate !== null) return true;
    if (filterMaxDate !== null) return true;
    if (filterWeekdays.size > 0) return true;

    return false;
  }, [filterMap, filterMinDate, filterMaxDate, filterWeekdays]);

  const prefixMap = useMemo(() => {
    const prefixMap = new Map<DietLogListFilterMapKey, string>();

    prefixMap.set("min-date", `Min Date: `);
    prefixMap.set("max-date", `Max Date: `);
    prefixMap.set("weekdays", `Days (${filterWeekdays.size}): `);

    return prefixMap;
  }, [filterWeekdays]);

  return {
    handleFilterSaveButton,
    filterMap,
    removeFilter,
    resetFilter,
    showResetFilterButton,
    prefixMap,
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    isMaxDateBeforeMinDate,
    filterWeekdays,
    setFilterWeekdays,
    filterMinCalories,
    setFilterMinCalories,
    filterMaxCalories,
    setFilterMaxCalories,
    filterMinFat,
    setFilterMinFat,
    filterMaxFat,
    setFilterMaxFat,
    filterMinCarbs,
    setFilterMinCarbs,
    filterMaxCarbs,
    setFilterMaxCarbs,
    filterMinProtein,
    setFilterMinProtein,
    filterMaxProtein,
    setFilterMaxProtein,
    weekdayMap,
  };
};

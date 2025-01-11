import { useState } from "react";
import { DietLogListFilterMapKey } from "../typings";
import { CalendarDate } from "@nextui-org/react";
import { useIsEndDateBeforeStartDate, useWeekdayMap } from ".";

export const useDietLogListFilters = () => {
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
};

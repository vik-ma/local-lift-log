import { useCallback, useMemo, useRef, useState } from "react";
import {
  TimePeriod,
  TimePeriodSortCategory,
  UseTimePeriodListReturnType,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import { FormatISODateString, IsDatePassed } from "../helpers";

export const useTimePeriodList = (): UseTimePeriodListReturnType => {
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<TimePeriodSortCategory>("name");

  const isTimePeriodListLoaded = useRef(false);

  const filteredTimePeriods = useMemo(() => {
    if (filterQuery !== "") {
      return timePeriods.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item.note
            ?.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item.formattedStartDate
            ?.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item.formattedEndDate
            ?.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item.caloric_intake
            ?.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item.injury
            ?.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          (item.injury && "injury".includes(filterQuery.toLocaleLowerCase())) ||
          (item.isOngoing &&
            "ongoing".includes(filterQuery.toLocaleLowerCase())) ||
          (item.end_date &&
            "end date".includes(filterQuery.toLocaleLowerCase()))
      );
    }
    return timePeriods;
  }, [timePeriods, filterQuery]);

  const getTimePeriods = useCallback(async (locale: string) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<TimePeriod[]>(
        `SELECT * FROM time_periods`
      );

      const timePeriods: TimePeriod[] = [];

      for (const row of result) {
        const formattedStartDate = FormatISODateString(row.start_date, locale);
        const formattedEndDate = FormatISODateString(row.end_date, locale);

        const isOngoing = row.end_date === null || !IsDatePassed(row.end_date);

        const timePeriod: TimePeriod = {
          id: row.id,
          name: row.name,
          start_date: row.start_date,
          end_date: row.end_date,
          note: row.note,
          caloric_intake: row.caloric_intake,
          injury: row.injury,
          formattedStartDate: formattedStartDate,
          formattedEndDate: formattedEndDate,
          isOngoing: isOngoing,
        };

        timePeriods.push(timePeriod);
      }

      setTimePeriods(timePeriods);

      isTimePeriodListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, []);

  const sortTimePeriodsByName = (timePeriodList: TimePeriod[]) => {
    timePeriodList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    setTimePeriods(timePeriodList);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "name") {
      setSortCategory(key);
      sortTimePeriodsByName([...timePeriods]);
    }
  };

  const sortTimePeriodByActiveCategory = (timePeriodList: TimePeriod[]) => {
    switch (sortCategory) {
      case "name":
        sortTimePeriodsByName(timePeriodList);
        break;
      default:
        break;
    }
  };

  return {
    timePeriods,
    setTimePeriods,
    filteredTimePeriods,
    filterQuery,
    setFilterQuery,
    isTimePeriodListLoaded,
    getTimePeriods,
    sortCategory,
    handleSortOptionSelection,
    sortTimePeriodByActiveCategory,
  };
};

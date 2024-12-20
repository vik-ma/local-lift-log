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
    useState<TimePeriodSortCategory>("ongoing");

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

      sortTimePeriodsByOngoingFirst(timePeriods);

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

  const sortTimePeriodsByOngoingFirst = (timePeriodList: TimePeriod[]) => {
    timePeriodList.sort((a, b) => {
      const aIsOngoing = a.isOngoing ? 1 : 0;
      const bIsOngoing = b.isOngoing ? 1 : 0;

      if (bIsOngoing !== aIsOngoing) {
        return bIsOngoing - aIsOngoing;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setTimePeriods(timePeriodList);
  };

  const sortTimePeriodsByStartDate = (
    timePeriodList: TimePeriod[],
    isAscending: boolean
  ) => {
    timePeriodList.sort((a, b) => {
      const dateA = a.start_date ?? "";
      const dateB = b.start_date ?? "";

      const dateComparison = isAscending
        ? dateA.localeCompare(dateB)
        : dateB.localeCompare(dateA);

      // Sort by date, then name if dates are equal
      return dateComparison !== 0
        ? dateComparison
        : a.name.localeCompare(b.name);
    });

    setTimePeriods(timePeriodList);
  };

  const sortTimePeriodsByEndDate = (
    timePeriodList: TimePeriod[],
    isAscending: boolean
  ) => {
    timePeriodList.sort((a, b) => {
      const dateA = a.end_date;
      const dateB = b.end_date;

      // Always place null end_dates last in list
      // Sort by name if both end_dates are null
      if (dateA === null && dateB === null) return a.name.localeCompare(b.name);
      if (dateA === null) return 1;
      if (dateB === null) return -1;

      const dateComparison = isAscending
        ? dateA.localeCompare(dateB)
        : dateB.localeCompare(dateA);

      // Sort by name if dates are equal
      if (dateComparison === 0) {
        return a.name.localeCompare(b.name);
      }

      return dateComparison;
    });

    setTimePeriods(timePeriodList);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "name") {
      setSortCategory(key);
      sortTimePeriodsByName([...timePeriods]);
    } else if (key === "ongoing") {
      setSortCategory(key);
      sortTimePeriodsByOngoingFirst([...timePeriods]);
    } else if (key === "start-date-desc") {
      setSortCategory(key);
      sortTimePeriodsByStartDate([...timePeriods], false);
    } else if (key === "start-date-asc") {
      setSortCategory(key);
      sortTimePeriodsByStartDate([...timePeriods], true);
    } else if (key === "end-date-desc") {
      setSortCategory(key);
      sortTimePeriodsByEndDate([...timePeriods], false);
    } else if (key === "end-date-asc") {
      setSortCategory(key);
      sortTimePeriodsByEndDate([...timePeriods], true);
    }
  };

  const sortTimePeriodByActiveCategory = (timePeriodList: TimePeriod[]) => {
    switch (sortCategory) {
      case "ongoing":
        sortTimePeriodsByOngoingFirst([...timePeriodList]);
        break;
      case "name":
        sortTimePeriodsByName([...timePeriodList]);
        break;
      case "start-date-desc":
        sortTimePeriodsByStartDate([...timePeriodList], false);
        break;
      case "start-date-asc":
        sortTimePeriodsByStartDate([...timePeriodList], true);
        break;
      case "end-date-desc":
        sortTimePeriodsByEndDate([...timePeriodList], false);
        break;
      case "end-date-asc":
        sortTimePeriodsByEndDate([...timePeriodList], true);
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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TimePeriod } from "../typings";
import Database from "tauri-plugin-sql-api";

export const useTimePeriodList = (getTimePeriodsOnLoad: boolean) => {
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const isTimePeriodListLoaded = useRef(false);

  const filteredTimePeriods = useMemo(() => {
    if (filterQuery !== "") {
      return timePeriods.filter((item) =>
        item.name.toLocaleLowerCase().includes(filterQuery.toLocaleLowerCase())
      );
    }
    return timePeriods;
  }, [timePeriods, filterQuery]);

  const getTimePeriods = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<TimePeriod[]>(
        `SELECT * FROM time_periods`
      );

      setTimePeriods(result);

      isTimePeriodListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (getTimePeriodsOnLoad) {
      getTimePeriods();
    }
  }, [getTimePeriodsOnLoad, getTimePeriods]);

  return {
    timePeriods,
    setTimePeriods,
    filteredTimePeriods,
    filterQuery,
    setFilterQuery,
    isTimePeriodListLoaded,
  };
};

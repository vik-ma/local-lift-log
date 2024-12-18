import { useCallback, useMemo, useRef, useState } from "react";
import { TimePeriod } from "../typings";
import Database from "tauri-plugin-sql-api";
import { FormatISODateString } from "../helpers";

export const useTimePeriodList = () => {
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
        };

        timePeriods.push(timePeriod);
      }

      setTimePeriods(timePeriods);

      isTimePeriodListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, []);

  return {
    timePeriods,
    setTimePeriods,
    filteredTimePeriods,
    filterQuery,
    setFilterQuery,
    isTimePeriodListLoaded,
    getTimePeriods,
  };
};

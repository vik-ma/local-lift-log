import { useCallback, useEffect, useRef, useState } from "react";
import {
  DietLog,
  DietLogMap,
  UseDietLogListReturnType,
  DietLogSortCategory,
} from "../typings";
import Database from "tauri-plugin-sql-api";

export const useDietLogList = (
  getDietLogsOnLoad: boolean
): UseDietLogListReturnType => {
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [sortCategory, setSortCategory] =
    useState<DietLogSortCategory>("date-desc");
  const dietLogMap = useRef<DietLogMap>(new Map());

  const isDietLogListLoaded = useRef(false);

  const getDietLogs = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<DietLog[]>(`SELECT * FROM diet_logs`);

      const newDietLogMap = new Map<string, DietLog>();

      result.map((item) => newDietLogMap.set(item.date, item));

      sortDietLogsByDate(result, false);

      dietLogMap.current = newDietLogMap;
      isDietLogListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (getDietLogsOnLoad) {
      getDietLogs();
    }
  }, [getDietLogsOnLoad, getDietLogs]);

  const sortDietLogsByDate = (dietLogList: DietLog[], isAscending: boolean) => {
    if (isAscending) {
      dietLogList.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      dietLogList.sort((a, b) => b.date.localeCompare(a.date));
    }

    setDietLogs(dietLogList);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "date-desc") {
      setSortCategory(key);
      sortDietLogsByDate([...dietLogs], false);
    } else if (key === "date-asc") {
      setSortCategory(key);
      sortDietLogsByDate([...dietLogs], true);
    }
  };

  const sortDietLogsByActiveCategory = (dietLogList: DietLog[]) => {
    switch (sortCategory) {
      case "date-desc":
        sortDietLogsByDate([...dietLogList], false);
        break;
      case "date-asc":
        sortDietLogsByDate([...dietLogList], true);
        break;
      default:
        break;
    }
  };

  return {
    dietLogs,
    dietLogMap,
    isDietLogListLoaded,
    sortCategory,
    sortDietLogsByActiveCategory,
    handleSortOptionSelection,
  };
};

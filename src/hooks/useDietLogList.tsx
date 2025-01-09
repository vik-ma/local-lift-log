import { useCallback, useEffect, useRef, useState } from "react";
import {
  DietLog,
  DietLogMap,
  UseDietLogListReturnType,
  DietLogSortCategory,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import {
  DeleteItemFromList,
  FormatYmdDateString,
  ShouldDietLogDisableExpansion,
} from "../helpers";

export const useDietLogList = (
  getDietLogsOnLoad: boolean
): UseDietLogListReturnType => {
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [sortCategory, setSortCategory] =
    useState<DietLogSortCategory>("date-desc");
  const [dietLogMap, setDietLogMap] = useState<DietLogMap>(new Map());

  const isDietLogListLoaded = useRef(false);

  const getDietLogs = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<DietLog[]>(`SELECT * FROM diet_logs`);

      const dietLogs: DietLog[] = [];
      const dietLogMap = new Map<string, DietLog>();

      for (const row of result) {
        const formattedDate = FormatYmdDateString(row.date);

        const disableExpansion = ShouldDietLogDisableExpansion(
          row.fat,
          row.carbs,
          row.protein
        );

        const dietLog: DietLog = {
          ...row,
          formattedDate: formattedDate,
          isExpanded: false,
          disableExpansion: disableExpansion,
        };

        dietLogs.push(dietLog);
        dietLogMap.set(dietLog.date, dietLog);
      }

      sortDietLogsByDate(dietLogs, false);
      setDietLogMap(dietLogMap);
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

  const addDietLog = async (dietLog: DietLog) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        `INSERT into diet_logs 
        (date, calories, fat, carbs, protein, comment) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          dietLog.date,
          dietLog.calories,
          dietLog.fat,
          dietLog.carbs,
          dietLog.protein,
          dietLog.comment,
        ]
      );

      const newDietLog: DietLog = { ...dietLog, id: result.lastInsertId };

      const updatedDietLogs = [...dietLogs, newDietLog];

      sortDietLogsByActiveCategory(updatedDietLogs);

      const updatedDietLogMap = new Map(dietLogMap);

      updatedDietLogMap.set(newDietLog.date, newDietLog);

      setDietLogMap(updatedDietLogMap);

      return newDietLog;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  const deleteDietLog = async (
    dietLog: DietLog,
    returnNewLatestDietLog?: boolean
  ): Promise<{ success: boolean; newLatestDietLog: DietLog | undefined }> => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from diet_logs WHERE id = $1", [dietLog.id]);

      const updatedDietLogs = DeleteItemFromList(dietLogs, dietLog.id);

      setDietLogs(updatedDietLogs);

      const updatedDietLogMap = new Map(dietLogMap);

      updatedDietLogMap.delete(dietLog.date);

      setDietLogMap(updatedDietLogMap);

      const newLatestDietLog =
        returnNewLatestDietLog && updatedDietLogs.length > 0
          ? updatedDietLogs[0]
          : undefined;

      return {
        success: true,
        newLatestDietLog,
      };
    } catch (error) {
      console.log(error);
      return { success: false, newLatestDietLog: undefined };
    }
  };

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
    addDietLog,
    deleteDietLog,
  };
};

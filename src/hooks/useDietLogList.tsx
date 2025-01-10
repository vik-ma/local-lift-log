import { useCallback, useEffect, useRef, useState } from "react";
import {
  DietLog,
  DietLogMap,
  UseDietLogListReturnType,
  DietLogSortCategory,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import {
  DeleteDietLogWithId,
  DeleteItemFromList,
  FormatYmdDateString,
  InsertDietLogIntoDatabase,
  ShouldDietLogDisableExpansion,
  UpdateItemInList,
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
    const newDietLogId = await InsertDietLogIntoDatabase(dietLog);

    if (newDietLogId === 0) return undefined;

    const newDietLog: DietLog = { ...dietLog, id: newDietLogId };

    const updatedDietLogs = [...dietLogs, newDietLog];

    sortDietLogsByActiveCategory(updatedDietLogs);

    const updatedDietLogMap = new Map(dietLogMap);

    updatedDietLogMap.set(newDietLog.date, newDietLog);

    setDietLogMap(updatedDietLogMap);

    return newDietLog;
  };

  const updateDietLog = async (
    dietLog: DietLog,
    returnNewLatestDietLog?: boolean
  ): Promise<{ success: boolean; newLatestDietLog: DietLog | undefined }> => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute(
        `UPDATE diet_logs SET 
         date = $1, calories = $2, fat = $3, 
         carbs = $4, protein = $5, comment = $6 
         WHERE id = $7`,
        [
          dietLog.date,
          dietLog.calories,
          dietLog.fat,
          dietLog.carbs,
          dietLog.protein,
          dietLog.comment,
          dietLog.id,
        ]
      );

      const updatedDietLogs = UpdateItemInList(dietLogs, dietLog);

      if (returnNewLatestDietLog) {
        sortDietLogsByDate(updatedDietLogs, false);
      } else {
        sortDietLogsByActiveCategory(updatedDietLogs);
      }

      const updatedDietLogMap = new Map(dietLogMap);

      updatedDietLogMap.set(dietLog.date, dietLog);

      setDietLogMap(updatedDietLogMap);

      const newLatestDietLog = returnNewLatestDietLog
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

  const deleteDietLog = async (
    dietLog: DietLog,
    returnNewLatestDietLog?: boolean
  ): Promise<{ success: boolean; newLatestDietLog: DietLog | undefined }> => {
    const success = await DeleteDietLogWithId(dietLog.id);

    if (!success) return { success: false, newLatestDietLog: undefined };

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
    setDietLogs,
    dietLogMap,
    isDietLogListLoaded,
    sortCategory,
    sortDietLogsByActiveCategory,
    handleSortOptionSelection,
    addDietLog,
    updateDietLog,
    deleteDietLog,
  };
};

import { useCallback, useEffect, useRef, useState } from "react";
import { DietLog, DietLogMap, UseDietLogListReturnType } from "../typings";
import Database from "tauri-plugin-sql-api";

export const useDietLogList = (
  getDietLogsOnLoad: boolean
): UseDietLogListReturnType => {
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const dietLogMap = useRef<DietLogMap>(new Map());

  const isDietLogListLoaded = useRef(false);

  const getDietLogs = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<DietLog[]>(`SELECT * FROM diet_logs`);

      const newDietLogMap = new Map<string, DietLog>();

      result.map((item) => newDietLogMap.set(item.date, item));

      setDietLogs(result);

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

  return {
    dietLogs,
    dietLogMap,
    isDietLogListLoaded,
  };
};

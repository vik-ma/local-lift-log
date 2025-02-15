import { useEffect, useMemo, useRef, useState } from "react";
import {
  DietLog,
  DietLogMap,
  UseDietLogListReturnType,
  DietLogSortCategory,
} from "../typings";
import Database from "tauri-plugin-sql-api";
import {
  ConvertDateToYmdString,
  DeleteDietLogWithId,
  DeleteItemFromList,
  FormatYmdDateString,
  GetAllDietLogs,
  InsertDietLogIntoDatabase,
  IsDateInWeekdaySet,
  IsDateWithinLimit,
  IsNumberWithinLimit,
  ShouldDietLogDisableExpansion,
  UpdateItemInList,
} from "../helpers";
import { useDisclosure } from "@heroui/react";
import { useDietLogListFilters } from "./useDietLogListFilters";

export const useDietLogList = (
  getDietLogsOnLoad: boolean
): UseDietLogListReturnType => {
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [sortCategory, setSortCategory] =
    useState<DietLogSortCategory>("date-desc");
  const [dietLogMap, setDietLogMap] = useState<DietLogMap>(new Map());
  const [filterQuery, setFilterQuery] = useState<string>("");

  const filterDietLogListModal = useDisclosure();

  const isDietLogListLoaded = useRef(false);

  const dietLogListFilters = useDietLogListFilters();

  const {
    filterMap,
    filterMinDate,
    filterMaxDate,
    filterWeekdays,
    filterMinCalories,
    filterMaxCalories,
    filterMinFat,
    filterMaxFat,
    filterMinCarbs,
    filterMaxCarbs,
    filterMinProtein,
    filterMaxProtein,
    includeNullInMaxValuesFat,
    includeNullInMaxValuesCarbs,
    includeNullInMaxValuesProtein,
  } = dietLogListFilters;

  const filteredDietLogs = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return dietLogs.filter(
        (item) =>
          (item.calories.toString().includes(filterQuery.toLocaleLowerCase()) ||
            item.date.includes(filterQuery.toLocaleLowerCase()) ||
            item.formattedDate?.includes(filterQuery.toLocaleLowerCase()) ||
            item.comment
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          (!filterMap.has("min-date") ||
            IsDateWithinLimit(item.date, filterMinDate, false)) &&
          (!filterMap.has("max-date") ||
            IsDateWithinLimit(item.date, filterMaxDate, true)) &&
          (!filterMap.has("weekdays") ||
            IsDateInWeekdaySet(item.date, filterWeekdays)) &&
          (!filterMap.has("min-calories") ||
            IsNumberWithinLimit(item.calories, filterMinCalories, false)) &&
          (!filterMap.has("max-calories") ||
            IsNumberWithinLimit(item.calories, filterMaxCalories, true)) &&
          (!filterMap.has("min-fat") ||
            IsNumberWithinLimit(item.fat, filterMinFat, false)) &&
          (!filterMap.has("max-fat") ||
            IsNumberWithinLimit(
              item.fat,
              filterMaxFat,
              true,
              includeNullInMaxValuesFat
            )) &&
          (!filterMap.has("min-carbs") ||
            IsNumberWithinLimit(item.carbs, filterMinCarbs, false)) &&
          (!filterMap.has("max-carbs") ||
            IsNumberWithinLimit(
              item.carbs,
              filterMaxCarbs,
              true,
              includeNullInMaxValuesCarbs
            )) &&
          (!filterMap.has("min-protein") ||
            IsNumberWithinLimit(item.protein, filterMinProtein, false)) &&
          (!filterMap.has("max-protein") ||
            IsNumberWithinLimit(
              item.protein,
              filterMaxProtein,
              true,
              includeNullInMaxValuesProtein
            ))
      );
    }
    return dietLogs;
  }, [
    dietLogs,
    filterQuery,
    filterMap,
    filterMinDate,
    filterMaxDate,
    filterWeekdays,
    filterMinCalories,
    filterMaxCalories,
    filterMinFat,
    filterMaxFat,
    filterMinCarbs,
    filterMaxCarbs,
    filterMinProtein,
    filterMaxProtein,
    includeNullInMaxValuesFat,
    includeNullInMaxValuesCarbs,
    includeNullInMaxValuesProtein,
  ]);

  const getDietLogs = async () => {
    const result = await GetAllDietLogs(false);

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

    setDietLogs(dietLogs);
    setDietLogMap(dietLogMap);
    isDietLogListLoaded.current = true;
  };

  useEffect(() => {
    if (getDietLogsOnLoad) {
      getDietLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      sortDietLogsByActiveCategory(updatedDietLogs);

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

    sortDietLogsByActiveCategory(updatedDietLogs);

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

  const addDietLogEntryRange = async (
    startDate: Date,
    endDate: Date,
    overwriteExistingDietLogs: boolean,
    dietLogTemplate: DietLog,
    latestDate?: number
  ) => {
    const date = startDate;

    const updatedDietLogMap = new Map(dietLogMap);

    const newDietLogs: DietLog[] = [];

    let latestDietLog: DietLog | undefined = undefined;

    while (date <= endDate) {
      const dateString = ConvertDateToYmdString(date);

      if (overwriteExistingDietLogs || !dietLogMap.has(dateString)) {
        const formattedDate = FormatYmdDateString(dateString);

        const dietLog: DietLog = {
          ...dietLogTemplate,
          date: dateString,
          formattedDate,
        };

        if (dietLogMap.has(dateString)) {
          // Delete old Diet Log for date
          const id = dietLogMap.get(dateString)!.id;

          await DeleteDietLogWithId(id);
        }

        const dietLogId = await InsertDietLogIntoDatabase(dietLog);

        if (dietLogId !== 0) {
          dietLog.id = dietLogId;
          newDietLogs.push(dietLog);
          updatedDietLogMap.set(dateString, dietLog);

          if (latestDate !== undefined && date.getTime() >= latestDate) {
            // Return the latest DietLog if a new one was created
            latestDietLog = dietLog;
          }
        }
      }

      date.setDate(date.getDate() + 1);
    }

    const updatedDietLogs = Array.from(updatedDietLogMap.values());
    sortDietLogsByActiveCategory(updatedDietLogs);
    setDietLogMap(updatedDietLogMap);

    return latestDietLog;
  };

  const sortDietLogsByDate = (dietLogList: DietLog[], isAscending: boolean) => {
    if (isAscending) {
      dietLogList.sort((a, b) => a.date.localeCompare(b.date));
    } else {
      dietLogList.sort((a, b) => b.date.localeCompare(a.date));
    }

    setDietLogs(dietLogList);
  };

  const sortDietLogsByCalories = (
    dietLogList: DietLog[],
    isAscending: boolean
  ) => {
    dietLogList.sort((a, b) => {
      if (a.calories !== b.calories) {
        if (isAscending) {
          return a.calories - b.calories;
        } else {
          return b.calories - a.calories;
        }
      } else {
        // Show latest date first if same calories
        return b.date.localeCompare(a.date);
      }
    });

    setDietLogs(dietLogList);
  };

  const handleSortOptionSelection = (key: string) => {
    if (key === "date-desc") {
      setSortCategory(key);
      sortDietLogsByDate([...dietLogs], false);
    } else if (key === "date-asc") {
      setSortCategory(key);
      sortDietLogsByDate([...dietLogs], true);
    } else if (key === "calories-desc") {
      setSortCategory(key);
      sortDietLogsByCalories([...dietLogs], false);
    } else if (key === "calories-asc") {
      setSortCategory(key);
      sortDietLogsByCalories([...dietLogs], true);
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
      case "calories-desc":
        sortDietLogsByCalories([...dietLogList], false);
        break;
      case "calories-asc":
        sortDietLogsByCalories([...dietLogList], true);
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
    filterQuery,
    setFilterQuery,
    filteredDietLogs,
    filterDietLogListModal,
    dietLogListFilters,
    addDietLogEntryRange,
    getDietLogs,
  };
};

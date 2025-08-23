import { useMemo, useRef, useState } from "react";
import {
  DietLog,
  DietLogMap,
  UseDietLogListReturnType,
  DietLogSortCategory,
  StoreRef,
  UserSettings,
} from "../typings";
import Database from "@tauri-apps/plugin-sql";
import {
  ConvertDateToYmdString,
  DefaultNewDietLog,
  DeleteDietLogWithId,
  DeleteItemFromList,
  FormatYmdDateString,
  GetAllDietLogs,
  GetSortCategoryFromStore,
  InsertDietLogIntoDatabase,
  IsDateInWeekdaySet,
  IsDateWithinLimit,
  IsNumberWithinLimit,
  ShouldDietLogDisableExpansion,
  UpdateItemInList,
} from "../helpers";
import { useDisclosure } from "@heroui/react";
import { useDietLogListFilters } from ".";

type UseDietLogListProps = {
  store: StoreRef;
};

export const useDietLogList = ({
  store,
}: UseDietLogListProps): UseDietLogListReturnType => {
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [sortCategory, setSortCategory] =
    useState<DietLogSortCategory>("date-desc");
  const [dietLogMap, setDietLogMap] = useState<DietLogMap>(new Map());
  const [filterQuery, setFilterQuery] = useState<string>("");

  const defaultDietLog = DefaultNewDietLog();

  const [latestDietLog, setLatestDietLog] = useState<DietLog>(defaultDietLog);

  const filterDietLogListModal = useDisclosure();

  const isDietLogListLoaded = useRef(false);

  const dietLogListFilters = useDietLogListFilters({ store: store });

  const { filterMap, dietLogFilterValues, loadDietLogFilterMapFromStore } =
    dietLogListFilters;

  const {
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
  } = dietLogFilterValues;

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

  const getDietLogs = async (category: DietLogSortCategory) => {
    const isAscending = false;

    const result = await GetAllDietLogs(isAscending);

    const dietLogs: DietLog[] = [];
    const dietLogMap = new Map<string, DietLog>();

    let latestValidDietLog: DietLog | undefined = undefined;

    const currentDate = new Date();

    for (const row of result) {
      if (dietLogMap.has(row.date)) continue;

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

      if (
        latestValidDietLog === undefined &&
        new Date(row.date) <= currentDate
      ) {
        latestValidDietLog = dietLog;
      }
    }

    sortDietLogsByActiveCategory(dietLogs, category);
    setDietLogMap(dietLogMap);
    setLatestDietLog(
      latestValidDietLog !== undefined ? latestValidDietLog : defaultDietLog
    );

    isDietLogListLoaded.current = true;
  };

  const addDietLog = async (dietLog: DietLog) => {
    if (dietLog.id !== 0 || dietLogMap.has(dietLog.date)) return undefined;

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

  const updateDietLog = async (dietLog: DietLog) => {
    if (dietLog.id === 0) return undefined;

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

      return updatedDietLogs[0];
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  const deleteDietLog = async (dietLog: DietLog) => {
    const success = await DeleteDietLogWithId(dietLog.id);

    if (!success) return undefined;

    const updatedDietLogs = DeleteItemFromList(dietLogs, dietLog.id);

    sortDietLogsByActiveCategory(updatedDietLogs);

    const updatedDietLogMap = new Map(dietLogMap);

    updatedDietLogMap.delete(dietLog.date);

    setDietLogMap(updatedDietLogMap);

    if (updatedDietLogs.length === 0) return undefined;

    const newLatestDietLog = updatedDietLogs[0];

    return newLatestDietLog;
  };

  const addDietLogEntryRange = async (
    startDate: Date,
    endDate: Date,
    overwriteExistingDietLogs: boolean,
    dietLogTemplate: DietLog,
    latestDate?: number
  ) => {
    if (dietLogTemplate.id !== 0) return undefined;

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

  const handleSortOptionSelection = async (key: string) => {
    if (store.current === null) return;

    await store.current.set("sort-category-diet-logs", { value: key });

    await sortDietLogsByActiveCategory(
      [...dietLogs],
      key as DietLogSortCategory
    );
  };

  const sortDietLogsByActiveCategory = async (
    dietLogList: DietLog[],
    newCategory?: DietLogSortCategory
  ) => {
    if (store.current === null) return;

    if (newCategory !== undefined) {
      setSortCategory(newCategory);
    }

    const activeCategory = newCategory ?? sortCategory;

    const isAscending = true;

    switch (activeCategory) {
      case "date-asc":
        sortDietLogsByDate([...dietLogList], isAscending);
        break;
      case "date-desc":
        sortDietLogsByDate([...dietLogList], !isAscending);
        break;
      case "calories-asc":
        sortDietLogsByCalories([...dietLogList], isAscending);
        break;
      case "calories-desc":
        sortDietLogsByCalories([...dietLogList], !isAscending);
        break;
      default:
        // Overwrite invalid categories
        setSortCategory("date-desc");
        await store.current.set("sort-category-diet-logs", {
          value: "date-desc",
        });
        sortDietLogsByDate([...dietLogList], !isAscending);
        break;
    }
  };

  const loadDietLogList = async (userSettings: UserSettings) => {
    if (isDietLogListLoaded.current) return;

    await loadDietLogFilterMapFromStore(userSettings.locale);

    const sortCategory = await GetSortCategoryFromStore(
      store,
      "date-desc" as DietLogSortCategory,
      "diet-logs"
    );

    await getDietLogs(sortCategory);
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
    latestDietLog,
    setLatestDietLog,
    defaultDietLog,
    loadDietLogFilterMapFromStore,
    loadDietLogList,
  };
};

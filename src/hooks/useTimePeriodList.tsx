import { useMemo, useRef, useState } from "react";
import {
  StoreRef,
  TimePeriod,
  TimePeriodSortCategory,
  UseTimePeriodListReturnType,
} from "../typings";
import Database from "@tauri-apps/plugin-sql";
import {
  FormatISODateString,
  GetNumberOfDaysBetweenDates,
  GetValidatedDietPhase,
  IsDatePassed,
  IsDateWithinLimit,
  IsNumberWithinLimit,
  ValidateStartAndEndDateStrings,
} from "../helpers";
import { useDisclosure } from "@heroui/react";
import { useTimePeriodListFilters } from ".";

type UseTimePeriodListProps = {
  store: StoreRef;
};

export const useTimePeriodList = ({
  store,
}: UseTimePeriodListProps): UseTimePeriodListReturnType => {
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [sortCategory, setSortCategory] =
    useState<TimePeriodSortCategory>("ongoing");
  const [selectedTimePeriodProperties, setSelectedTimePeriodProperties] =
    useState<Set<string>>(new Set());

  const isTimePeriodListLoaded = useRef(false);

  const filterTimePeriodListModal = useDisclosure();

  const timePeriodListFilters = useTimePeriodListFilters({ store: store });

  const {
    filterMap,
    filterMinStartDate,
    filterMaxStartDate,
    filterMinEndDate,
    filterMaxEndDate,
    filterMinDuration,
    filterMaxDuration,
    filterDietPhaseTypes,
    filterHasInjury,
    filterStatus,
    loadTimePeriodFilterMapFromStore,
  } = timePeriodListFilters;

  const filteredTimePeriods = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return timePeriods.filter(
        (item) =>
          (item.name
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
            item.diet_phase
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            item.injury
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            (item.injury &&
              "injury".includes(filterQuery.toLocaleLowerCase())) ||
            (item.isOngoing &&
              "ongoing".includes(filterQuery.toLocaleLowerCase())) ||
            (item.end_date &&
              "end date".includes(filterQuery.toLocaleLowerCase()))) &&
          (!filterMap.has("min-date-start") ||
            IsDateWithinLimit(item.start_date, filterMinStartDate, false)) &&
          (!filterMap.has("max-date-start") ||
            IsDateWithinLimit(item.start_date, filterMaxStartDate, true)) &&
          (!filterMap.has("min-date-end") ||
            IsDateWithinLimit(item.end_date, filterMinEndDate, false)) &&
          (!filterMap.has("max-date-end") ||
            IsDateWithinLimit(item.end_date, filterMaxEndDate, true)) &&
          (!filterMap.has("min-duration") ||
            IsNumberWithinLimit(
              item.numDaysBetweenDates,
              filterMinDuration,
              false
            )) &&
          (!filterMap.has("max-duration") ||
            IsNumberWithinLimit(
              item.numDaysBetweenDates,
              filterMaxDuration,
              true
            )) &&
          (!filterMap.has("diet-phase") ||
            (item.diet_phase !== null &&
              filterDietPhaseTypes.has(item.diet_phase))) &&
          (!filterMap.has("injury") ||
            (item.injury !== null && filterHasInjury.has("Has Injury")) ||
            (item.injury === null && filterHasInjury.has("No Injury"))) &&
          (!filterMap.has("status") ||
            (item.isOngoing && filterStatus.has("Ongoing")) ||
            (!item.isOngoing && filterStatus.has("Ended")))
      );
    }
    return timePeriods;
  }, [
    timePeriods,
    filterQuery,
    filterMap,
    filterMinStartDate,
    filterMaxStartDate,
    filterMinEndDate,
    filterMaxEndDate,
    filterMinDuration,
    filterMaxDuration,
    filterDietPhaseTypes,
    filterHasInjury,
    filterStatus,
  ]);

  const getTimePeriods = async (
    locale: string,
    category: TimePeriodSortCategory
  ) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<TimePeriod[]>(
        `SELECT * FROM time_periods`
      );

      const timePeriods: TimePeriod[] = [];

      for (const row of result) {
        if (!ValidateStartAndEndDateStrings(row.start_date, row.end_date))
          continue;

        const formattedStartDate = FormatISODateString(row.start_date, locale);
        const formattedEndDate = FormatISODateString(row.end_date, locale);

        const isOngoing = row.end_date === null || !IsDatePassed(row.end_date);

        const numDaysBetweenDates = GetNumberOfDaysBetweenDates(
          row.start_date,
          row.end_date
        );

        const timePeriod: TimePeriod = {
          id: row.id,
          name: row.name,
          start_date: row.start_date,
          end_date: row.end_date,
          note: row.note,
          diet_phase: GetValidatedDietPhase(row.diet_phase),
          injury: row.injury,
          formattedStartDate: formattedStartDate,
          formattedEndDate: formattedEndDate,
          isOngoing: isOngoing,
          numDaysBetweenDates: numDaysBetweenDates,
        };

        timePeriods.push(timePeriod);
      }

      sortTimePeriodsByActiveCategory(timePeriods, category);

      isTimePeriodListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  };

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

  const sortTimePeriodsByLength = (
    timePeriodList: TimePeriod[],
    isAscending: boolean
  ) => {
    timePeriodList.sort((a, b) => {
      // Always place null end_dates last in list
      // Sort by name if both end_dates are null
      if (a.end_date === null && b.end_date === null)
        return a.name.localeCompare(b.name);
      if (a.end_date === null) return 1;
      if (b.end_date === null) return -1;

      const startA = a.start_date ? new Date(a.start_date).getTime() : 0;
      const endA = new Date(a.end_date).getTime();

      const startB = b.start_date ? new Date(b.start_date).getTime() : 0;
      const endB = new Date(b.end_date).getTime();

      // Place items with invalid date strings at end of list
      if (isNaN(startA) || isNaN(endA)) return 1;
      if (isNaN(startB) || isNaN(endB)) return -1;

      const durationA = endA - startA;
      const durationB = endB - startB;

      // Calculate time duration delta
      const durationComparison = isAscending
        ? durationA - durationB
        : durationB - durationA;

      // Sort by name if duration length are equal
      return durationComparison !== 0
        ? durationComparison
        : a.name.localeCompare(b.name);
    });

    setTimePeriods(timePeriodList);
  };

  const handleSortOptionSelection = async (key: string) => {
    if (store.current === null) return;

    await store.current.set("sort-category-time-periods", { value: key });

    await sortTimePeriodsByActiveCategory(
      [...timePeriods],
      key as TimePeriodSortCategory
    );
  };

  const sortTimePeriodsByActiveCategory = async (
    timePeriodList: TimePeriod[],
    newCategory?: TimePeriodSortCategory
  ) => {
    if (store.current === null) return;

    if (newCategory !== undefined) {
      setSortCategory(newCategory);
    }

    const activeCategory = newCategory ?? sortCategory;

    const isAscending = true;

    switch (activeCategory) {
      case "ongoing":
        sortTimePeriodsByOngoingFirst([...timePeriodList]);
        break;
      case "name":
        sortTimePeriodsByName([...timePeriodList]);
        break;
      case "start-date-asc":
        sortTimePeriodsByStartDate([...timePeriodList], isAscending);
        break;
      case "start-date-desc":
        sortTimePeriodsByStartDate([...timePeriodList], !isAscending);
        break;
      case "end-date-asc":
        sortTimePeriodsByEndDate([...timePeriodList], isAscending);
        break;
      case "end-date-desc":
        sortTimePeriodsByEndDate([...timePeriodList], !isAscending);
        break;
      case "length-asc":
        sortTimePeriodsByLength([...timePeriodList], isAscending);
        break;
      case "length-desc":
        sortTimePeriodsByLength([...timePeriodList], !isAscending);
        break;
      default:
        // Overwrite invalid categories
        setSortCategory("ongoing");
        await store.current.set("sort-category-time-periods", {
          value: "ongoing",
        });
        sortTimePeriodsByOngoingFirst([...timePeriodList]);
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
    sortTimePeriodsByActiveCategory,
    filterTimePeriodListModal,
    timePeriodListFilters,
    selectedTimePeriodProperties,
    setSelectedTimePeriodProperties,
    loadTimePeriodFilterMapFromStore,
  };
};

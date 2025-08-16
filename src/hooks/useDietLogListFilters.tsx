import { useMemo, useRef, useState } from "react";
import {
  DietLogFilterMap,
  DietLogFilterValues,
  DietLogListFilterMapKey,
  StoreRef,
  UseDietLogListFiltersReturnType,
  UseDisclosureReturnType,
} from "../typings";
import { CalendarDate } from "@heroui/react";
import { useIsEndDateBeforeStartDate, useWeekdayMap } from ".";
import {
  ConvertCalendarDateToYmdString,
  ConvertDateStringToCalendarDate,
  IsEndDateBeforeStartDate,
  IsNumberValidInteger,
} from "../helpers";

type UseDietLogListFiltersProps = {
  store: StoreRef;
};

type IncludeNullInMaxValuesKey =
  | "include-null-in-max-values-fat"
  | "include-null-in-max-values-carbs"
  | "include-null-in-max-values-protein";

type DietLogStoreFilterMap = Map<
  DietLogListFilterMapKey | IncludeNullInMaxValuesKey,
  string | number | boolean
>;

export const useDietLogListFilters = ({
  store,
}: UseDietLogListFiltersProps): UseDietLogListFiltersReturnType => {
  const [filterMap, setFilterMap] = useState<DietLogFilterMap>(new Map());
  const [filterMinDate, setFilterMinDate] = useState<CalendarDate | null>(null);
  const [filterMaxDate, setFilterMaxDate] = useState<CalendarDate | null>(null);
  const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(new Set());
  const [filterMinCalories, setFilterMinCalories] = useState<number | null>(
    null
  );
  const [filterMaxCalories, setFilterMaxCalories] = useState<number | null>(
    null
  );
  const [filterMinFat, setFilterMinFat] = useState<number | null>(null);
  const [filterMaxFat, setFilterMaxFat] = useState<number | null>(null);
  const [filterMinCarbs, setFilterMinCarbs] = useState<number | null>(null);
  const [filterMaxCarbs, setFilterMaxCarbs] = useState<number | null>(null);
  const [filterMinProtein, setFilterMinProtein] = useState<number | null>(null);
  const [filterMaxProtein, setFilterMaxProtein] = useState<number | null>(null);

  const isMaxDateBeforeMinDate = useIsEndDateBeforeStartDate({
    startDate: filterMinDate,
    endDate: filterMaxDate,
  });

  const weekdayMap = useWeekdayMap();



  const storeFilters = useRef<DietLogStoreFilterMap>(new Map());

  const handleFilterSaveButton = (
    activeModal?: UseDisclosureReturnType,
    filterValues?: DietLogFilterValues
  ) => {
    const updatedFilterMap: DietLogFilterMap = new Map();
    const storeFilterMap: DietLogStoreFilterMap = new Map();

    const minDate = filterValues?.filterValueMinDate ?? filterMinDate;
    if (minDate !== null) {
      const filterMinDateString = ConvertCalendarDateToYmdString(minDate);

      if (filterMinDateString !== null) {
        updatedFilterMap.set("min-date", filterMinDateString);
        storeFilterMap.set("min-date", filterMinDateString);
      }
    }

    const maxDate = filterValues?.filterValueMaxDate ?? filterMaxDate;
    if (maxDate !== null) {
      const filterMaxDateString = ConvertCalendarDateToYmdString(maxDate);

      if (filterMaxDateString !== null) {
        updatedFilterMap.set("max-date", filterMaxDateString);
        storeFilterMap.set("max-date", filterMaxDateString);
      }
    }

    const weekdays = filterValues?.filterValueWeekdays ?? filterWeekdays;
    if (weekdays.size > 0) {
      const weekdaysArray = Array.from(weekdays);

      const filterWeekdaysString = weekdaysArray
        .map((day) => (weekdayMap.get(day) ?? "").substring(0, 3))
        .join(", ");

      updatedFilterMap.set("weekdays", filterWeekdaysString);

      const filterValueWeekdaysString = weekdaysArray.join(",");

      storeFilterMap.set("weekdays", filterValueWeekdaysString);
    }

    const minCalories =
      filterValues?.filterValueMinCalories ?? filterMinCalories;
    if (minCalories !== null) {
      const filterMinCaloriesString = `${minCalories} kcal`;

      updatedFilterMap.set("min-calories", filterMinCaloriesString);
      storeFilterMap.set("min-calories", minCalories);
    }

    const maxCalories =
      filterValues?.filterValueMaxCalories ?? filterMaxCalories;
    if (maxCalories !== null) {
      const filterMaxCaloriesString = `${maxCalories} kcal`;

      updatedFilterMap.set("max-calories", filterMaxCaloriesString);
      storeFilterMap.set("max-calories", maxCalories);
    }

    const minFat = filterValues?.filterValueMinFat ?? filterMinFat;
    if (minFat !== null) {
      const filterMinFatString = `${minFat} g`;

      updatedFilterMap.set("min-fat", filterMinFatString);
      storeFilterMap.set("min-fat", minFat);
    }

    const maxFat = filterValues?.filterValueMaxFat ?? filterMaxFat;
    if (maxFat !== null) {
      const filterMaxFatString = `${maxFat} g`;

      updatedFilterMap.set("max-fat", filterMaxFatString);
      storeFilterMap.set("max-fat", maxFat);
    }

    const minCarbs = filterValues?.filterValueMinCarbs ?? filterMinCarbs;
    if (minCarbs !== null) {
      const filterMinCarbsString = `${minCarbs} g`;

      updatedFilterMap.set("min-carbs", filterMinCarbsString);
      storeFilterMap.set("min-carbs", minCarbs);
    }

    const maxCarbs = filterValues?.filterValueMaxCarbs ?? filterMaxCarbs;
    if (maxCarbs !== null) {
      const filterMaxCarbsString = `${maxCarbs} g`;

      updatedFilterMap.set("max-carbs", filterMaxCarbsString);
      storeFilterMap.set("max-carbs", maxCarbs);
    }

    const minProtein = filterValues?.filterValueMinProtein ?? filterMinProtein;
    if (minProtein !== null) {
      const filterMinProteinString = `${minProtein} g`;

      updatedFilterMap.set("min-protein", filterMinProteinString);
      storeFilterMap.set("min-protein", minProtein);
    }

    const maxProtein = filterValues?.filterValueMaxProtein ?? filterMaxProtein;
    if (maxProtein !== null) {
      const filterMaxProteinString = `${maxProtein} g`;

      updatedFilterMap.set("max-protein", filterMaxProteinString);
      storeFilterMap.set("max-protein", maxProtein);
    }

    setFilterMap(updatedFilterMap);

    saveFilterMapToStore(storeFilterMap);

    if (activeModal !== undefined) activeModal.onClose();
  };

  const removeFilter = (key: string) => {
    const updatedFilterMap = new Map(filterMap);
    const updatedStoreFilterMap = new Map(storeFilters.current);

    switch (key) {
      case "min-date": {
        setFilterMinDate(null);
        break;
      }
      case "max-date": {
        setFilterMaxDate(null);
        break;
      }
      case "weekdays": {
        setFilterWeekdays(new Set());
        break;
      }
      case "min-calories": {
        setFilterMinCalories(null);
        break;
      }
      case "max-calories": {
        setFilterMaxCalories(null);
        break;
      }
      case "min-fat": {
        setFilterMinFat(null);
        break;
      }
      case "max-fat": {
        setFilterMaxFat(null);
        break;
      }
      case "min-carbs": {
        setFilterMinCarbs(null);
        break;
      }
      case "max-carbs": {
        setFilterMaxCarbs(null);
        break;
      }
      case "min-protein": {
        setFilterMinProtein(null);
        break;
      }
      case "max-protein": {
        setFilterMaxProtein(null);
        break;
      }
      default: {
        return;
      }
    }

    updatedFilterMap.delete(key as DietLogListFilterMapKey);
    updatedStoreFilterMap.delete(key as DietLogListFilterMapKey);

    setFilterMap(updatedFilterMap);

    saveFilterMapToStore(updatedStoreFilterMap);
  };

  const resetFilter = () => {
    setFilterMap(new Map());
    setFilterMinDate(null);
    setFilterMaxDate(null);
    setFilterWeekdays(new Set());
    setFilterMinCalories(null);
    setFilterMaxCalories(null);
    setFilterMinFat(null);
    setFilterMaxFat(null);
    setFilterMinCarbs(null);
    setFilterMaxCarbs(null);
    setFilterMinProtein(null);
    setFilterMaxProtein(null);

    saveFilterMapToStore(new Map());
  };

  const showResetFilterButton = useMemo(() => {
    if (filterMap.size > 0) return true;
    if (filterMinDate !== null) return true;
    if (filterMaxDate !== null) return true;
    if (filterWeekdays.size > 0) return true;
    if (filterMinCalories !== null) return true;
    if (filterMaxCalories !== null) return true;
    if (filterMinFat !== null) return true;
    if (filterMaxFat !== null) return true;
    if (filterMinCarbs !== null) return true;
    if (filterMaxCarbs !== null) return true;
    if (filterMinProtein !== null) return true;
    if (filterMaxProtein !== null) return true;

    return false;
  }, [
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
  ]);

  const prefixMap = useMemo(() => {
    const prefixMap: DietLogFilterMap = new Map();

    prefixMap.set("min-date", `Min Date: `);
    prefixMap.set("max-date", `Max Date: `);
    prefixMap.set("weekdays", `Days (${filterWeekdays.size}): `);
    prefixMap.set("min-calories", `Min Calories: `);
    prefixMap.set("max-calories", `Max Calories: `);
    prefixMap.set("min-fat", `Min Fat: `);
    prefixMap.set("max-fat", `Max Fat: `);
    prefixMap.set("min-carbs", `Min Carbs: `);
    prefixMap.set("max-carbs", `Max Carbs: `);
    prefixMap.set("min-protein", `Min Protein: `);
    prefixMap.set("max-protein", `Max Protein: `);

    return prefixMap;
  }, [filterWeekdays]);

  const saveFilterMapToStore = async (
    storeFilterMap: DietLogStoreFilterMap
  ) => {
    if (store.current === null) return;

    if (includeNullInMaxValuesFat) {
      storeFilterMap.set(
        "include-null-in-max-values-fat",
        includeNullInMaxValuesFat
      );
    }

    if (includeNullInMaxValuesCarbs) {
      storeFilterMap.set(
        "include-null-in-max-values-carbs",
        includeNullInMaxValuesCarbs
      );
    }

    if (includeNullInMaxValuesProtein) {
      storeFilterMap.set(
        "include-null-in-max-values-protein",
        includeNullInMaxValuesProtein
      );
    }

    await store.current.set("filter-map-diet-logs", {
      value: JSON.stringify(Array.from(storeFilterMap.entries())),
    });

    storeFilters.current = storeFilterMap;
  };

  const loadDietLogFilterMapFromStore = async () => {
    if (store.current === null) return;

    const val = await store.current.get<{ value: string }>(
      "filter-map-diet-logs"
    );

    if (val === undefined) return;

    try {
      const storeFilterList: [
        DietLogListFilterMapKey | IncludeNullInMaxValuesKey,
        string | number | boolean
      ][] = JSON.parse(val.value);

      if (!Array.isArray(storeFilterList) || storeFilterList.length === 0) {
        handleFilterSaveButton();
        return;
      }

      const filterStoreValues: DietLogFilterValues = {};

      const addedKeys = new Set<
        DietLogListFilterMapKey | IncludeNullInMaxValuesKey
      >();

      for (const filter of storeFilterList) {
        const key = filter[0];
        const value = filter[1];

        if (key === undefined || value === undefined || addedKeys.has(key))
          continue;

        addedKeys.add(key);

        switch (key) {
          case "min-date": {
            const minDate = ConvertDateStringToCalendarDate(value as string);

            if (minDate !== null) {
              setFilterMinDate(minDate);
              filterStoreValues.filterValueMinDate = minDate;
            }

            break;
          }
          case "max-date": {
            const maxDate = ConvertDateStringToCalendarDate(value as string);

            let isMaxDateBeforeMinDate = false;

            if (filterStoreValues.filterValueMinDate) {
              isMaxDateBeforeMinDate = IsEndDateBeforeStartDate(
                filterStoreValues.filterValueMinDate,
                maxDate
              );
            }

            if (maxDate !== null && !isMaxDateBeforeMinDate) {
              setFilterMaxDate(maxDate);
              filterStoreValues.filterValueMaxDate = maxDate;
            }

            break;
          }
          case "weekdays": {
            const weekdaysString = value as string;

            const weekdays = weekdaysString.split(",").sort();

            const weekdaysSet = new Set<string>();

            for (const day of weekdays) {
              if (weekdayMap.has(day)) {
                weekdaysSet.add(day);
              }
            }

            setFilterWeekdays(weekdaysSet);
            filterStoreValues.filterValueWeekdays = weekdaysSet;

            break;
          }
          case "min-calories": {
            const minCalories = value as number;

            const minValue = 0;
            const doNotAllowMinValue = true;

            if (
              IsNumberValidInteger(minCalories, minValue, doNotAllowMinValue)
            ) {
              setFilterMinCalories(minCalories);
              filterStoreValues.filterValueMinCalories = minCalories;
            }

            break;
          }
          case "max-calories": {
            const maxCalories = value as number;

            const minValue = filterStoreValues.filterValueMinCalories ?? 0;
            const doNotAllowMinValue = minValue === 0;

            if (
              IsNumberValidInteger(maxCalories, minValue, doNotAllowMinValue)
            ) {
              setFilterMaxCalories(maxCalories);
              filterStoreValues.filterValueMaxCalories = maxCalories;
            }

            break;
          }
          case "min-fat": {
            const minFat = value as number;

            const minValue = 0;
            const doNotAllowMinValue = true;

            if (IsNumberValidInteger(minFat, minValue, doNotAllowMinValue)) {
              setFilterMinFat(minFat);
              filterStoreValues.filterValueMinFat = minFat;
            }

            break;
          }
          case "max-fat": {
            const maxFat = value as number;

            const minValue = filterStoreValues.filterValueMinFat ?? 0;
            const doNotAllowMinValue = minValue === 0;

            if (IsNumberValidInteger(maxFat, minValue, doNotAllowMinValue)) {
              setFilterMaxFat(maxFat);
              filterStoreValues.filterValueMaxFat = maxFat;
            }

            break;
          }
          case "min-carbs": {
            const minCarbs = value as number;

            const minValue = 0;
            const doNotAllowMinValue = true;

            if (IsNumberValidInteger(minCarbs, minValue, doNotAllowMinValue)) {
              setFilterMinCarbs(minCarbs);
              filterStoreValues.filterValueMinCarbs = minCarbs;
            }

            break;
          }
          case "max-carbs": {
            const maxCarbs = value as number;

            const minValue = filterStoreValues.filterValueMinCarbs ?? 0;
            const doNotAllowMinValue = minValue === 0;

            if (IsNumberValidInteger(maxCarbs, minValue, doNotAllowMinValue)) {
              setFilterMaxCarbs(maxCarbs);
              filterStoreValues.filterValueMaxCarbs = maxCarbs;
            }

            break;
          }
          case "min-protein": {
            const minProtein = value as number;

            const minValue = 0;
            const doNotAllowMinValue = true;

            if (
              IsNumberValidInteger(minProtein, minValue, doNotAllowMinValue)
            ) {
              setFilterMinProtein(minProtein);
              filterStoreValues.filterValueMinProtein = minProtein;
            }

            break;
          }
          case "max-protein": {
            const maxProtein = value as number;

            const minValue = filterStoreValues.filterValueMinProtein ?? 0;
            const doNotAllowMinValue = minValue === 0;

            if (
              IsNumberValidInteger(maxProtein, minValue, doNotAllowMinValue)
            ) {
              setFilterMaxProtein(maxProtein);
              filterStoreValues.filterValueMaxProtein = maxProtein;
            }

            break;
          }
          case "include-null-in-max-values-fat": {
            if (value === true) {
              setIncludeNullInMaxValuesFat(true);
            }

            break;
          }
          case "include-null-in-max-values-carbs": {
            if (value === true) {
              setIncludeNullInMaxValuesCarbs(true);
            }

            break;
          }
          case "include-null-in-max-values-protein": {
            if (value === true) {
              setIncludeNullInMaxValuesProtein(true);
            }

            break;
          }
          default:
            break;
        }
      }

      handleFilterSaveButton(undefined, filterStoreValues);
    } catch {
      handleFilterSaveButton();
    }
  };

  return {
    handleFilterSaveButton,
    filterMap,
    removeFilter,
    resetFilter,
    showResetFilterButton,
    prefixMap,
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    isMaxDateBeforeMinDate,
    filterWeekdays,
    setFilterWeekdays,
    filterMinCalories,
    setFilterMinCalories,
    filterMaxCalories,
    setFilterMaxCalories,
    filterMinFat,
    setFilterMinFat,
    filterMaxFat,
    setFilterMaxFat,
    filterMinCarbs,
    setFilterMinCarbs,
    filterMaxCarbs,
    setFilterMaxCarbs,
    filterMinProtein,
    setFilterMinProtein,
    filterMaxProtein,
    setFilterMaxProtein,
    weekdayMap,
    loadDietLogFilterMapFromStore,
  };
};

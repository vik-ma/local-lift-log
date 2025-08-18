import { useMemo, useRef, useState } from "react";
import {
  DietLogFilterMap,
  DietLogFilterValues,
  DietLogListFilterMapKey,
  StoreRef,
  UseDietLogListFiltersReturnType,
  UseDisclosureReturnType,
} from "../typings";
import {
  ConvertCalendarDateToYmdString,
  ConvertDateStringToCalendarDate,
  DefaultDietLogFilterValues,
  IsEndDateBeforeStartDate,
  IsNumberValidInteger,
} from "../helpers";
import { useWeekdayMap } from "./useWeekdayMap";

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

  const defaultDietLogFilterValues = useMemo(
    () => DefaultDietLogFilterValues(),
    []
  );

  const [dietLogFilterValues, setDietLogFilterValues] =
    useState<DietLogFilterValues>(defaultDietLogFilterValues);

  const weekdayMap = useWeekdayMap();

  const storeFilters = useRef<DietLogStoreFilterMap>(new Map());

  const handleFilterSaveButton = (
    filterValues: DietLogFilterValues,
    activeModal?: UseDisclosureReturnType
  ) => {
    const updatedFilterMap: DietLogFilterMap = new Map();
    const storeFilterMap: DietLogStoreFilterMap = new Map();

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
    } = filterValues;

    if (filterMinDate !== null) {
      const filterMinDateString = ConvertCalendarDateToYmdString(filterMinDate);

      if (filterMinDateString !== null) {
        updatedFilterMap.set("min-date", filterMinDateString);
        storeFilterMap.set("min-date", filterMinDateString);
      }
    }

    if (filterMaxDate !== null) {
      const filterMaxDateString = ConvertCalendarDateToYmdString(filterMaxDate);

      if (filterMaxDateString !== null) {
        updatedFilterMap.set("max-date", filterMaxDateString);
        storeFilterMap.set("max-date", filterMaxDateString);
      }
    }

    if (filterWeekdays.size > 0) {
      const weekdaysArray = Array.from(filterWeekdays);

      const filterWeekdaysString = weekdaysArray
        .map((day) => (weekdayMap.get(day) ?? "").substring(0, 3))
        .join(", ");

      updatedFilterMap.set("weekdays", filterWeekdaysString);

      const filterWeekdaysStoreString = weekdaysArray.join(",");

      storeFilterMap.set("weekdays", filterWeekdaysStoreString);
    }

    if (filterMinCalories !== null) {
      const filterMinCaloriesString = `${filterMinCalories} kcal`;

      updatedFilterMap.set("min-calories", filterMinCaloriesString);
      storeFilterMap.set("min-calories", filterMinCalories);
    }

    if (filterMaxCalories !== null) {
      const filterMaxCaloriesString = `${filterMaxCalories} kcal`;

      updatedFilterMap.set("max-calories", filterMaxCaloriesString);
      storeFilterMap.set("max-calories", filterMaxCalories);
    }

    if (filterMinFat !== null) {
      const filterMinFatString = `${filterMinFat} g`;

      updatedFilterMap.set("min-fat", filterMinFatString);
      storeFilterMap.set("min-fat", filterMinFat);
    }

    if (filterMaxFat !== null) {
      const filterMaxFatString = `${filterMaxFat} g`;

      updatedFilterMap.set("max-fat", filterMaxFatString);
      storeFilterMap.set("max-fat", filterMaxFat);
    }

    if (filterMinCarbs !== null) {
      const filterMinCarbsString = `${filterMinCarbs} g`;

      updatedFilterMap.set("min-carbs", filterMinCarbsString);
      storeFilterMap.set("min-carbs", filterMinCarbs);
    }

    if (filterMaxCarbs !== null) {
      const filterMaxCarbsString = `${filterMaxCarbs} g`;

      updatedFilterMap.set("max-carbs", filterMaxCarbsString);
      storeFilterMap.set("max-carbs", filterMaxCarbs);
    }

    if (filterMinProtein !== null) {
      const filterMinProteinString = `${filterMinProtein} g`;

      updatedFilterMap.set("min-protein", filterMinProteinString);
      storeFilterMap.set("min-protein", filterMinProtein);
    }

    if (filterMaxProtein !== null) {
      const filterMaxProteinString = `${filterMaxProtein} g`;

      updatedFilterMap.set("max-protein", filterMaxProteinString);
      storeFilterMap.set("max-protein", filterMaxProtein);
    }

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

    setFilterMap(updatedFilterMap);
    setDietLogFilterValues(filterValues);
    saveFilterMapToStore(storeFilterMap);

    if (activeModal !== undefined) activeModal.onClose();
  };

  const removeFilter = (key: string) => {
    const updatedFilterMap = new Map(filterMap);
    const updatedStoreFilterMap = new Map(storeFilters.current);
    const updatedDietLogFilterValues = { ...dietLogFilterValues };

    switch (key) {
      case "min-date": {
        updatedDietLogFilterValues.filterMinDate = null;
        break;
      }
      case "max-date": {
        updatedDietLogFilterValues.filterMaxDate = null;
        break;
      }
      case "weekdays": {
        updatedDietLogFilterValues.filterWeekdays = new Set();
        break;
      }
      case "min-calories": {
        updatedDietLogFilterValues.filterMinCalories = null;
        break;
      }
      case "max-calories": {
        updatedDietLogFilterValues.filterMaxCalories = null;
        break;
      }
      case "min-fat": {
        updatedDietLogFilterValues.filterMinFat = null;
        break;
      }
      case "max-fat": {
        updatedDietLogFilterValues.filterMaxFat = null;
        break;
      }
      case "min-carbs": {
        updatedDietLogFilterValues.filterMinCarbs = null;
        break;
      }
      case "max-carbs": {
        updatedDietLogFilterValues.filterMaxCarbs = null;
        break;
      }
      case "min-protein": {
        updatedDietLogFilterValues.filterMinProtein = null;
        break;
      }
      case "max-protein": {
        updatedDietLogFilterValues.filterMaxProtein = null;
        break;
      }
      default: {
        return;
      }
    }

    updatedFilterMap.delete(key as DietLogListFilterMapKey);
    updatedStoreFilterMap.delete(key as DietLogListFilterMapKey);

    setFilterMap(updatedFilterMap);
    setDietLogFilterValues(updatedDietLogFilterValues);
    saveFilterMapToStore(updatedStoreFilterMap);
  };

  const resetFilter = () => {
    setFilterMap(new Map());
    setDietLogFilterValues({ ...defaultDietLogFilterValues });
    saveFilterMapToStore(new Map());
  };

  const prefixMap = useMemo(() => {
    const prefixMap: DietLogFilterMap = new Map();

    prefixMap.set("min-date", `Min Date: `);
    prefixMap.set("max-date", `Max Date: `);
    prefixMap.set(
      "weekdays",
      `Days (${dietLogFilterValues.filterWeekdays.size}): `
    );
    prefixMap.set("min-calories", `Min Calories: `);
    prefixMap.set("max-calories", `Max Calories: `);
    prefixMap.set("min-fat", `Min Fat: `);
    prefixMap.set("max-fat", `Max Fat: `);
    prefixMap.set("min-carbs", `Min Carbs: `);
    prefixMap.set("max-carbs", `Max Carbs: `);
    prefixMap.set("min-protein", `Min Protein: `);
    prefixMap.set("max-protein", `Max Protein: `);

    return prefixMap;
  }, [dietLogFilterValues.filterWeekdays]);

  const saveFilterMapToStore = async (
    storeFilterMap: DietLogStoreFilterMap
  ) => {
    if (store.current === null) return;

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
        handleFilterSaveButton(defaultDietLogFilterValues);
        return;
      }

      const filterStoreValues: DietLogFilterValues = {
        ...defaultDietLogFilterValues,
      };

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
              filterStoreValues.filterMinDate = minDate;
            }

            break;
          }
          case "max-date": {
            const maxDate = ConvertDateStringToCalendarDate(value as string);

            let isMaxDateBeforeMinDate = false;

            if (filterStoreValues.filterMinDate) {
              isMaxDateBeforeMinDate = IsEndDateBeforeStartDate(
                filterStoreValues.filterMinDate,
                maxDate
              );
            }

            if (maxDate !== null && !isMaxDateBeforeMinDate) {
              filterStoreValues.filterMaxDate = maxDate;
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

            filterStoreValues.filterWeekdays = weekdaysSet;

            break;
          }
          case "min-calories": {
            const minCalories = value as number;

            const minValue = 0;
            const doNotAllowMinValue = true;

            if (
              IsNumberValidInteger(minCalories, minValue, doNotAllowMinValue)
            ) {
              filterStoreValues.filterMinCalories = minCalories;
            }

            break;
          }
          case "max-calories": {
            const maxCalories = value as number;

            const minValue = filterStoreValues.filterMinCalories ?? 0;
            const doNotAllowMinValue = minValue === 0;

            if (
              IsNumberValidInteger(maxCalories, minValue, doNotAllowMinValue)
            ) {
              filterStoreValues.filterMaxCalories = maxCalories;
            }

            break;
          }
          case "min-fat": {
            const minFat = value as number;

            const minValue = 0;
            const doNotAllowMinValue = true;

            if (IsNumberValidInteger(minFat, minValue, doNotAllowMinValue)) {
              filterStoreValues.filterMinFat = minFat;
            }

            break;
          }
          case "max-fat": {
            const maxFat = value as number;

            const minValue = filterStoreValues.filterMinFat ?? 0;
            const doNotAllowMinValue = minValue === 0;

            if (IsNumberValidInteger(maxFat, minValue, doNotAllowMinValue)) {
              filterStoreValues.filterMaxFat = maxFat;
            }

            break;
          }
          case "min-carbs": {
            const minCarbs = value as number;

            const minValue = 0;
            const doNotAllowMinValue = true;

            if (IsNumberValidInteger(minCarbs, minValue, doNotAllowMinValue)) {
              filterStoreValues.filterMinCarbs = minCarbs;
            }

            break;
          }
          case "max-carbs": {
            const maxCarbs = value as number;

            const minValue = filterStoreValues.filterMinCarbs ?? 0;
            const doNotAllowMinValue = minValue === 0;

            if (IsNumberValidInteger(maxCarbs, minValue, doNotAllowMinValue)) {
              filterStoreValues.filterMaxCarbs = maxCarbs;
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
              filterStoreValues.filterMinProtein = minProtein;
            }

            break;
          }
          case "max-protein": {
            const maxProtein = value as number;

            const minValue = filterStoreValues.filterMinProtein ?? 0;
            const doNotAllowMinValue = minValue === 0;

            if (
              IsNumberValidInteger(maxProtein, minValue, doNotAllowMinValue)
            ) {
              filterStoreValues.filterMaxProtein = maxProtein;
            }

            break;
          }
          case "include-null-in-max-values-fat": {
            if (value === true) {
              filterStoreValues.includeNullInMaxValuesFat = true;
            }

            break;
          }
          case "include-null-in-max-values-carbs": {
            if (value === true) {
              filterStoreValues.includeNullInMaxValuesCarbs = true;
            }

            break;
          }
          case "include-null-in-max-values-protein": {
            if (value === true) {
              filterStoreValues.includeNullInMaxValuesProtein = true;
            }

            break;
          }
          default:
            break;
        }
      }

      handleFilterSaveButton(filterStoreValues, undefined);
    } catch {
      handleFilterSaveButton(defaultDietLogFilterValues);
    }
  };

  return {
    handleFilterSaveButton,
    filterMap,
    removeFilter,
    resetFilter,
    prefixMap,
    weekdayMap,
    loadDietLogFilterMapFromStore,
    dietLogFilterValues,
  };
};

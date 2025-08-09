import { useMemo, useRef, useState } from "react";
import {
  DietLogFilterMap,
  DietLogListFilterMapKey,
  StoreRef,
  UseDietLogListFiltersReturnType,
  UseDisclosureReturnType,
} from "../typings";
import { CalendarDate } from "@heroui/react";
import {
  useFilterMinAndMaxValueInputs,
  useIsEndDateBeforeStartDate,
  useWeekdayMap,
} from ".";
import {
  ConvertCalendarDateToYmdString,
  ConvertDateStringToCalendarDate,
  IsEndDateBeforeStartDate,
} from "../helpers";

type UseDietLogListFiltersProps = {
  store: StoreRef;
};

type FilterStoreValues = {
  storeMinDate?: CalendarDate | null;
  storeMaxDate?: CalendarDate | null;
  storeWeekdays?: Set<string>;
  storeMinCalories?: number;
  storeMaxCalories?: number;
  storeMinFat?: number;
  storeMaxFat?: number;
  storeMinCarbs?: number;
  storeMaxCarbs?: number;
  storeMinProtein?: number;
  storeMaxProtein?: number;
};

type DietLogStoreFilterMap = Map<DietLogListFilterMapKey, string | number>;

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

  const filterMinAndMaxValueInputsCalories = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsFat = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsCarbs = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsProtein = useFilterMinAndMaxValueInputs();

  const [includeNullInMaxValuesFat, setIncludeNullInMaxValuesFat] =
    useState<boolean>(false);
  const [includeNullInMaxValuesCarbs, setIncludeNullInMaxValuesCarbs] =
    useState<boolean>(false);
  const [includeNullInMaxValuesProtein, setIncludeNullInMaxValuesProtein] =
    useState<boolean>(false);

  const storeFilters = useRef<DietLogStoreFilterMap>(new Map());

  const handleFilterSaveButton = (
    activeModal?: UseDisclosureReturnType,
    filterStoreValues?: FilterStoreValues
  ) => {
    const updatedFilterMap: DietLogFilterMap = new Map();
    const storeFilterMap: DietLogStoreFilterMap = new Map();

    const minDate = filterStoreValues?.storeMinDate ?? filterMinDate;
    if (minDate !== null) {
      const filterMinDateString = ConvertCalendarDateToYmdString(minDate);

      if (filterMinDateString !== null) {
        updatedFilterMap.set("min-date", filterMinDateString);
        storeFilterMap.set("min-date", filterMinDateString);
      }
    }

    const maxDate = filterStoreValues?.storeMaxDate ?? filterMaxDate;
    if (maxDate !== null) {
      const filterMaxDateString = ConvertCalendarDateToYmdString(maxDate);

      if (filterMaxDateString !== null) {
        updatedFilterMap.set("max-date", filterMaxDateString);
        storeFilterMap.set("max-date", filterMaxDateString);
      }
    }

    const weekdays = filterStoreValues?.storeWeekdays ?? filterWeekdays;
    if (weekdays.size > 0) {
      const filterWeekdaysString = Array.from(weekdays)
        .map((day) => (weekdayMap.get(day) ?? "").substring(0, 3))
        .join(", ");

      updatedFilterMap.set("weekdays", filterWeekdaysString);
    }

    const minCalories =
      filterStoreValues?.storeMinCalories ?? filterMinCalories;
    if (minCalories !== null) {
      const filterMinCaloriesString = `${minCalories} kcal`;

      updatedFilterMap.set("min-calories", filterMinCaloriesString);
    }

    const maxCalories =
      filterStoreValues?.storeMaxCalories ?? filterMaxCalories;
    if (maxCalories !== null) {
      const filterMaxCaloriesString = `${maxCalories} kcal`;

      updatedFilterMap.set("max-calories", filterMaxCaloriesString);
    }

    const minFat = filterStoreValues?.storeMinFat ?? filterMinFat;
    if (minFat !== null) {
      const filterMinFatString = `${minFat} g`;

      updatedFilterMap.set("min-fat", filterMinFatString);
    }

    const maxFat = filterStoreValues?.storeMaxFat ?? filterMaxFat;
    if (maxFat !== null) {
      const filterMaxFatString = `${maxFat} g`;

      updatedFilterMap.set("max-fat", filterMaxFatString);
    }

    const minCarbs = filterStoreValues?.storeMinCarbs ?? filterMinCarbs;
    if (minCarbs !== null) {
      const filterMinCarbsString = `${minCarbs} g`;

      updatedFilterMap.set("min-carbs", filterMinCarbsString);
    }

    const maxCarbs = filterStoreValues?.storeMaxCarbs ?? filterMaxCarbs;
    if (maxCarbs !== null) {
      const filterMaxCarbsString = `${maxCarbs} g`;

      updatedFilterMap.set("max-carbs", filterMaxCarbsString);
    }

    const minProtein = filterStoreValues?.storeMinProtein ?? filterMinProtein;
    if (minProtein !== null) {
      const filterMinProteinString = `${minProtein} g`;

      updatedFilterMap.set("min-protein", filterMinProteinString);
    }

    const maxProtein = filterStoreValues?.storeMaxProtein ?? filterMaxProtein;
    if (maxProtein !== null) {
      const filterMaxProteinString = `${maxProtein} g`;

      updatedFilterMap.set("max-protein", filterMaxProteinString);
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
        filterMinAndMaxValueInputsCalories.resetMinInput();
        break;
      }
      case "max-calories": {
        setFilterMaxCalories(null);
        filterMinAndMaxValueInputsCalories.resetMaxInput();
        break;
      }
      case "min-fat": {
        setFilterMinFat(null);
        filterMinAndMaxValueInputsFat.resetMinInput();
        break;
      }
      case "max-fat": {
        setFilterMaxFat(null);
        filterMinAndMaxValueInputsFat.resetMaxInput();
        break;
      }
      case "min-carbs": {
        setFilterMinCarbs(null);
        filterMinAndMaxValueInputsCarbs.resetMinInput();
        break;
      }
      case "max-carbs": {
        setFilterMaxCarbs(null);
        filterMinAndMaxValueInputsCarbs.resetMaxInput();
        break;
      }
      case "min-protein": {
        setFilterMinProtein(null);
        filterMinAndMaxValueInputsProtein.resetMinInput();
        break;
      }
      case "max-protein": {
        setFilterMaxProtein(null);
        filterMinAndMaxValueInputsProtein.resetMinInput();
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
    filterMinAndMaxValueInputsCalories.resetInputs();
    filterMinAndMaxValueInputsFat.resetInputs();
    filterMinAndMaxValueInputsCarbs.resetInputs();
    filterMinAndMaxValueInputsProtein.resetInputs();

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
      const storeFilterList: [DietLogListFilterMapKey, string | number][] =
        JSON.parse(val.value);

      if (!Array.isArray(storeFilterList) || storeFilterList.length === 0) {
        handleFilterSaveButton();
        return;
      }

      const filterStoreValues: FilterStoreValues = {};

      const addedKeys = new Set<DietLogListFilterMapKey>();

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
              filterStoreValues.storeMinDate = minDate;
            }

            break;
          }
          case "max-date": {
            const maxDate = ConvertDateStringToCalendarDate(value as string);

            let isMaxDateBeforeMinDate = false;

            if (filterStoreValues.storeMinDate) {
              isMaxDateBeforeMinDate = IsEndDateBeforeStartDate(
                filterStoreValues.storeMinDate,
                maxDate
              );
            }

            if (maxDate !== null && !isMaxDateBeforeMinDate) {
              setFilterMaxDate(maxDate);
              filterStoreValues.storeMaxDate = maxDate;
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
    filterMinAndMaxValueInputsCalories,
    filterMinAndMaxValueInputsFat,
    filterMinAndMaxValueInputsCarbs,
    filterMinAndMaxValueInputsProtein,
    includeNullInMaxValuesFat,
    setIncludeNullInMaxValuesFat,
    includeNullInMaxValuesCarbs,
    setIncludeNullInMaxValuesCarbs,
    includeNullInMaxValuesProtein,
    setIncludeNullInMaxValuesProtein,
    loadDietLogFilterMapFromStore,
  };
};

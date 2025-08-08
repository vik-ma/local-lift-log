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
import { ConvertCalendarDateToYmdString } from "../helpers";

type UseDietLogListFiltersProps = {
  store: StoreRef;
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

  const handleFilterSaveButton = (activeModal: UseDisclosureReturnType) => {
    const updatedFilterMap: DietLogFilterMap = new Map();
    const storeFilterMap: DietLogStoreFilterMap = new Map();

    if (filterMinDate !== null) {
      const filterMinDateString = ConvertCalendarDateToYmdString(filterMinDate);

      if (filterMinDateString !== null) {
        updatedFilterMap.set("min-date", filterMinDateString);
      }
    }

    if (filterMaxDate !== null) {
      const filterMaxDateString = ConvertCalendarDateToYmdString(filterMaxDate);

      if (filterMaxDateString !== null) {
        updatedFilterMap.set("max-date", filterMaxDateString);
      }
    }

    if (filterWeekdays.size > 0) {
      const filterWeekdaysString = Array.from(filterWeekdays)
        .map((day) => (weekdayMap.get(day) ?? "").substring(0, 3))
        .join(", ");

      updatedFilterMap.set("weekdays", filterWeekdaysString);
    }

    if (filterMinCalories !== null) {
      const filterMinCaloriesString = `${filterMinCalories} kcal`;

      updatedFilterMap.set("min-calories", filterMinCaloriesString);
    }

    if (filterMaxCalories !== null) {
      const filterMaxCaloriesString = `${filterMaxCalories} kcal`;

      updatedFilterMap.set("max-calories", filterMaxCaloriesString);
    }

    if (filterMinFat !== null) {
      const filterMinFatString = `${filterMinFat} g`;

      updatedFilterMap.set("min-fat", filterMinFatString);
    }

    if (filterMaxFat !== null) {
      const filterMaxFatString = `${filterMaxFat} g`;

      updatedFilterMap.set("max-fat", filterMaxFatString);
    }

    if (filterMinCarbs !== null) {
      const filterMinCarbsString = `${filterMinCarbs} g`;

      updatedFilterMap.set("min-carbs", filterMinCarbsString);
    }

    if (filterMaxCarbs !== null) {
      const filterMaxCarbsString = `${filterMaxCarbs} g`;

      updatedFilterMap.set("max-carbs", filterMaxCarbsString);
    }

    if (filterMinProtein !== null) {
      const filterMinProteinString = `${filterMinProtein} g`;

      updatedFilterMap.set("min-protein", filterMinProteinString);
    }

    if (filterMaxProtein !== null) {
      const filterMaxProteinString = `${filterMaxProtein} g`;

      updatedFilterMap.set("max-protein", filterMaxProteinString);
    }

    setFilterMap(updatedFilterMap);

    saveFilterMapToStore(storeFilterMap);

    activeModal.onClose();
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
  };
};

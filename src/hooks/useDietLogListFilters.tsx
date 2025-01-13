import { useMemo, useState } from "react";
import {
  DietLogListFilterMapKey,
  UseDietLogListFiltersReturnType,
  UseDisclosureReturnType,
} from "../typings";
import { CalendarDate } from "@nextui-org/react";
import {
  useFilterMinAndMaxValueInputs,
  useIsEndDateBeforeStartDate,
  useWeekdayMap,
} from ".";
import { ConvertCalendarDateToYmdString } from "../helpers";

export const useDietLogListFilters = (): UseDietLogListFiltersReturnType => {
  const [filterMap, setFilterMap] = useState<
    Map<DietLogListFilterMapKey, string>
  >(new Map());
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

  const isMaxDateBeforeMinDate = useIsEndDateBeforeStartDate(
    filterMinDate,
    filterMaxDate
  );

  const weekdayMap = useWeekdayMap();

  const filterMinAndMaxValueInputsCalories = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsFat = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsCarbs = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsProtein = useFilterMinAndMaxValueInputs();

  const handleFilterSaveButton = (activeModal: UseDisclosureReturnType) => {
    const updatedFilterMap = new Map<DietLogListFilterMapKey, string>();

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

    activeModal.onClose();
  };

  const removeFilter = (key: string) => {
    const updatedFilterMap = new Map(filterMap);

    if (key === "min-date" && filterMap.has("min-date")) {
      updatedFilterMap.delete("min-date");
      setFilterMinDate(null);
    }

    if (key === "max-date" && filterMap.has("max-date")) {
      updatedFilterMap.delete("max-date");
      setFilterMaxDate(null);
    }

    if (key === "weekdays" && filterMap.has("weekdays")) {
      updatedFilterMap.delete("weekdays");
      setFilterWeekdays(new Set());
    }

    if (key === "min-calories" && filterMap.has("min-calories")) {
      updatedFilterMap.delete("min-calories");
      setFilterMinCalories(null);
      filterMinAndMaxValueInputsCalories.resetMinInput();
    }

    if (key === "max-calories" && filterMap.has("max-calories")) {
      updatedFilterMap.delete("max-calories");
      setFilterMaxCalories(null);
      filterMinAndMaxValueInputsCalories.resetMaxInput();
    }

    if (key === "min-fat" && filterMap.has("min-fat")) {
      updatedFilterMap.delete("min-fat");
      setFilterMinFat(null);
      filterMinAndMaxValueInputsFat.resetMinInput();
    }

    if (key === "max-fat" && filterMap.has("max-fat")) {
      updatedFilterMap.delete("max-fat");
      setFilterMaxFat(null);
      filterMinAndMaxValueInputsFat.resetMaxInput();
    }

    if (key === "min-carbs" && filterMap.has("min-carbs")) {
      updatedFilterMap.delete("min-carbs");
      setFilterMinCarbs(null);
      filterMinAndMaxValueInputsCarbs.resetMinInput();
    }

    if (key === "max-carbs" && filterMap.has("max-carbs")) {
      updatedFilterMap.delete("max-carbs");
      setFilterMaxCarbs(null);
      filterMinAndMaxValueInputsCarbs.resetMaxInput();
    }

    if (key === "min-protein" && filterMap.has("min-protein")) {
      updatedFilterMap.delete("min-protein");
      setFilterMinProtein(null);
      filterMinAndMaxValueInputsProtein.resetMinInput();
    }

    if (key === "max-protein" && filterMap.has("max-protein")) {
      updatedFilterMap.delete("max-protein");
      setFilterMaxProtein(null);
      filterMinAndMaxValueInputsProtein.resetMinInput();
    }

    setFilterMap(updatedFilterMap);
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
    const prefixMap = new Map<DietLogListFilterMapKey, string>();

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
  };
};

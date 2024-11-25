import { useMemo, useState } from "react";
import {
  ListFilterMapKey,
  MeasurementMap,
  NumberRange,
  RoutineMap,
  UseDisclosureReturnType,
  UseExerciseListReturnType,
  UseListFiltersReturnType,
} from "../typings";
import { CalendarDate, RangeValue } from "@nextui-org/react";
import { useDefaultNumberRange, useWeekdayMap } from ".";
import {
  CalculateNumDaysInCalendarDateRange,
  ConvertCalendarDateToLocalizedString,
  IsNumberRangeValidAndFiltered,
} from "../helpers";

export const useListFilters = (
  useExerciseList?: UseExerciseListReturnType,
  routineMap?: RoutineMap,
  measurementMap?: MeasurementMap
): UseListFiltersReturnType => {
  const [filterMap, setFilterMap] = useState<Map<ListFilterMapKey, string>>(
    new Map()
  );
  const [filterDateRange, setFilterDateRange] =
    useState<RangeValue<CalendarDate> | null>(null);
  const [filterRoutines, setFilterRoutines] = useState<Set<number>>(new Set());
  const [filterExercises, setFilterExercises] = useState<Set<number>>(
    new Set()
  );
  const [filterExerciseGroups, setFilterExerciseGroups] = useState<string[]>(
    []
  );
  const [filterMeasurements, setFilterMeasurements] = useState<Set<string>>(
    new Set()
  );

  const weekdayMap = useWeekdayMap();

  const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(
    new Set(weekdayMap.keys())
  );

  const defaultNumberRange = useDefaultNumberRange();

  const [filterWeightRange, setFilterWeightRange] =
    useState<NumberRange>(defaultNumberRange);

  const [filterWeightUnit, setFilterWeightUnit] = useState<string>("kg");

  const handleFilterSaveButton = (
    locale: string,
    activeModal: UseDisclosureReturnType
  ) => {
    const updatedFilterMap = new Map<ListFilterMapKey, string>();

    if (filterDateRange !== null) {
      const filterDateRangeString = `${ConvertCalendarDateToLocalizedString(
        filterDateRange.start,
        locale
      )} - ${ConvertCalendarDateToLocalizedString(
        filterDateRange.end,
        locale
      )}`;

      updatedFilterMap.set("dates", filterDateRangeString);
    }

    if (filterWeekdays.size < 7) {
      const filterWeekdaysString = Array.from(filterWeekdays)
        .map((day) => (weekdayMap.get(day) ?? "").substring(0, 3))
        .join(", ");

      updatedFilterMap.set("weekdays", filterWeekdaysString);
    }

    if (filterRoutines.size > 0 && routineMap !== undefined) {
      const filterRoutinesString = Array.from(filterRoutines)
        .map((id) => (routineMap.has(id) ? routineMap.get(id)!.name : ""))
        .join(", ");

      updatedFilterMap.set("routines", filterRoutinesString);
    }

    if (filterExercises.size > 0 && useExerciseList !== undefined) {
      const filterExercisesString = Array.from(filterExercises)
        .map((id) =>
          useExerciseList.exerciseMap.has(id)
            ? useExerciseList.exerciseMap.get(id)!.name
            : ""
        )
        .join(", ");

      updatedFilterMap.set("exercises", filterExercisesString);
    }

    if (filterExerciseGroups.length > 0 && useExerciseList !== undefined) {
      const filterExerciseGroupsString = Array.from(filterExerciseGroups)
        .map((id) =>
          useExerciseList.exerciseGroupDictionary.has(id)
            ? useExerciseList.exerciseGroupDictionary.get(id)!
            : ""
        )
        .join(", ");

      updatedFilterMap.set("exercise-groups", filterExerciseGroupsString);
    }

    if (IsNumberRangeValidAndFiltered(filterWeightRange)) {
      const filterWeightRangeString = `${filterWeightRange.start} ${filterWeightUnit} - ${filterWeightRange.end} ${filterWeightUnit}`;

      updatedFilterMap.set("weight", filterWeightRangeString);
    }

    if (filterMeasurements.size > 0 && measurementMap !== undefined) {
      const filterMeasurementsString = Array.from(filterMeasurements)
        .map((id) =>
          measurementMap.has(id.toString())
            ? measurementMap.get(id.toString())!.name
            : ""
        )
        .join(", ");

      updatedFilterMap.set("measurements", filterMeasurementsString);
    }

    setFilterMap(updatedFilterMap);

    activeModal.onClose();
  };

  const removeFilter = (key: ListFilterMapKey) => {
    const updatedFilterMap = new Map(filterMap);

    if (key === "dates" && filterMap.has("dates")) {
      updatedFilterMap.delete("dates");
      setFilterDateRange(null);
    }

    if (key === "weekdays" && filterMap.has("weekdays")) {
      updatedFilterMap.delete("weekdays");
      setFilterWeekdays(new Set(weekdayMap.keys()));
    }

    if (key === "routines" && filterMap.has("routines")) {
      updatedFilterMap.delete("routines");
      setFilterRoutines(new Set());
    }

    if (key === "exercises" && filterMap.has("exercises")) {
      updatedFilterMap.delete("exercises");
      setFilterExercises(new Set());
    }

    if (key === "exercise-groups" && filterMap.has("exercise-groups")) {
      updatedFilterMap.delete("exercise-groups");
      setFilterExerciseGroups([]);
    }

    if (key === "weight" && filterMap.has("weight")) {
      updatedFilterMap.delete("weight");
      setFilterWeightRange(defaultNumberRange);
    }

    if (key === "measurements" && filterMap.has("measurements")) {
      updatedFilterMap.delete("measurements");
      setFilterRoutines(new Set());
    }

    setFilterMap(updatedFilterMap);
  };

  const resetFilter = () => {
    setFilterMap(new Map());
    setFilterDateRange(null);
    setFilterWeekdays(new Set(weekdayMap.keys()));
    setFilterRoutines(new Set());
    setFilterExercises(new Set());
    setFilterExerciseGroups([]);
    setFilterWeightRange(defaultNumberRange);
    setFilterMeasurements(new Set());
  };

  const showResetFilterButton = useMemo(() => {
    if (filterMap.size > 0) return true;
    if (filterDateRange !== null) return true;
    if (filterWeekdays.size < 7) return true;
    if (filterRoutines.size > 0) return true;
    if (filterExercises.size > 0) return true;
    if (filterExerciseGroups.length > 0) return true;
    if (filterWeightRange.startInput !== "") return true;
    if (filterWeightRange.endInput !== "") return true;
    if (filterMeasurements.size > 0) return true;

    return false;
  }, [
    filterMap,
    filterDateRange,
    filterWeekdays,
    filterRoutines,
    filterExercises,
    filterExerciseGroups,
    filterWeightRange,
    filterMeasurements,
  ]);

  const prefixMap = useMemo(() => {
    const prefixMap = new Map<ListFilterMapKey, string>();
    prefixMap.set(
      "dates",
      `Dates (${CalculateNumDaysInCalendarDateRange(filterDateRange)}): `
    );
    prefixMap.set("weekdays", `Days (${filterWeekdays.size}): `);
    prefixMap.set("routines", `Routines (${filterRoutines.size}): `);
    prefixMap.set("exercises", `Exercises (${filterExercises.size}): `);
    prefixMap.set(
      "exercise-groups",
      `Exercise Groups (${filterExerciseGroups.length}): `
    );
    prefixMap.set("weight", `Weight: `);
    prefixMap.set(
      "measurements",
      `Measurements (${filterMeasurements.size}): `
    );
    return prefixMap;
  }, [
    filterDateRange,
    filterWeekdays,
    filterRoutines,
    filterExercises,
    filterExerciseGroups,
    filterMeasurements,
  ]);

  return {
    handleFilterSaveButton,
    filterDateRange,
    setFilterDateRange,
    filterMap,
    removeFilter,
    resetFilter,
    showResetFilterButton,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
    filterRoutines,
    setFilterRoutines,
    filterExercises,
    setFilterExercises,
    filterExerciseGroups,
    setFilterExerciseGroups,
    prefixMap,
    filterWeightRange,
    setFilterWeightRange,
    filterWeightUnit,
    setFilterWeightUnit,
    defaultNumberRange,
    filterMeasurements,
    setFilterMeasurements,
  };
};

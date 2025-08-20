import { useMemo, useRef, useState } from "react";
import {
  ListFilterValues,
  ListFilterMap,
  ListFilterMapKey,
  MeasurementMap,
  RoutineMap,
  StoreRef,
  UseDisclosureReturnType,
  UseExerciseListReturnType,
  UseListFiltersReturnType,
  WorkoutTemplateMap,
} from "../typings";
import { useWeekdayMap, useMultisetTypeMap } from ".";
import {
  ConvertCalendarDateToLocalizedString,
  ConvertDateStringToCalendarDate,
  ConvertNumberToTwoDecimals,
  DefaultListFilterValues,
  IsEndDateBeforeStartDate,
  IsNumberValid,
  IsNumberValidInteger,
  MeasurementTypes,
  ValidDistanceUnits,
  ValidWeightUnits,
} from "../helpers";

type UseListFiltersProps = {
  store: StoreRef;
  filterMapSuffix: string;
  useExerciseList?: UseExerciseListReturnType;
  routineMap?: RoutineMap;
  measurementMap?: MeasurementMap;
  workoutTemplateMap?: WorkoutTemplateMap;
};

type StoreFilterMapKey =
  | ListFilterMapKey
  | "weight-range-unit"
  | "distance-range-unit"
  | "include-null-in-max-values"
  | "include-secondary-exercise-groups";

type StoreFilterMap = Map<StoreFilterMapKey, string | number | boolean>;

export const useListFilters = ({
  store,
  filterMapSuffix,
  useExerciseList,
  routineMap,
  measurementMap,
  workoutTemplateMap,
}: UseListFiltersProps): UseListFiltersReturnType => {
  const [filterMap, setFilterMap] = useState<ListFilterMap>(new Map());
  // const [filterMinDate, setFilterMinDate] = useState<CalendarDate | null>(null);
  // const [filterMaxDate, setFilterMaxDate] = useState<CalendarDate | null>(null);
  // const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(new Set());
  // const [filterRoutines, setFilterRoutines] = useState<Set<number>>(new Set());
  // const [filterExercises, setFilterExercises] = useState<Set<number>>(
  //   new Set()
  // );
  // const [filterExerciseGroups, setFilterExerciseGroups] = useState<string[]>(
  //   []
  // );
  // const [filterMinWeight, setFilterMinWeight] = useState<number | null>(null);
  // const [filterMaxWeight, setFilterMaxWeight] = useState<number | null>(null);
  // const [filterMinDistance, setFilterMinDistance] = useState<number | null>(
  //   null
  // );
  // const [filterMaxDistance, setFilterMaxDistance] = useState<number | null>(
  //   null
  // );
  // const [filterMeasurements, setFilterMeasurements] = useState<Set<string>>(
  //   new Set()
  // );
  // const [filterMeasurementTypes, setFilterMeasurementTypes] = useState<
  //   Set<string>
  // >(new Set());
  // const [filterWorkoutTemplates, setFilterWorkoutTemplates] = useState<
  //   Set<number>
  // >(new Set());
  // const [filterScheduleTypes, setFilterScheduleTypes] = useState<Set<string>>(
  //   new Set()
  // );
  // const [filterMinNumScheduleDays, setFilterMinNumScheduleDays] = useState<
  //   number | null
  // >(null);
  // const [filterMaxNumScheduleDays, setFilterMaxNumScheduleDays] = useState<
  //   number | null
  // >(null);
  // const [filterWeightUnits, setFilterWeightUnits] = useState<Set<string>>(
  //   new Set()
  // );
  // const [filterDistanceUnits, setFilterDistanceUnits] = useState<Set<string>>(
  //   new Set()
  // );
  // const [filterMultisetTypes, setFilterMultisetTypes] = useState<Set<string>>(
  //   new Set()
  // );
  // const [filterMinBodyFatPercentage, setFilterMinBodyFatPercentage] = useState<
  //   number | null
  // >(null);
  // const [filterMaxBodyFatPercentage, setFilterMaxBodyFatPercentage] = useState<
  //   number | null
  // >(null);
  // const [filterWeightRangeUnit, setFilterWeightRangeUnit] =
  //   useState<string>("kg");
  // const [filterDistanceRangeUnit, setFilterDistanceRangeUnit] =
  //   useState<string>("km");

  const defaultListFilterValues = useMemo(() => DefaultListFilterValues(), []);

  const [listFilterValues, setListFilterValues] = useState<ListFilterValues>(
    defaultListFilterValues
  );

  const weekdayMap = useWeekdayMap();

  const multisetTypeMap = useMultisetTypeMap();

  const storeFilters = useRef<StoreFilterMap>(new Map());

  const handleFilterSaveButton = (
    locale: string,
    filterValues: ListFilterValues,
    activeModal?: UseDisclosureReturnType
  ) => {
    const updatedFilterMap: ListFilterMap = new Map();
    const storeFilterMap: StoreFilterMap = new Map();

    const {
      filterMinDate,
      filterMaxDate,
      filterWeekdays,
      filterRoutines,
      filterExercises,
      filterExerciseGroups,
      filterMinWeight,
      filterMaxWeight,
      filterMinDistance,
      filterMaxDistance,
      filterMeasurements,
      filterWorkoutTemplates,
      filterScheduleTypes,
      filterMinNumScheduleDays,
      filterMaxNumScheduleDays,
      filterWeightUnits,
      filterDistanceUnits,
      filterMultisetTypes,
      filterMinBodyFatPercentage,
      filterMaxBodyFatPercentage,
      filterWeightRangeUnit,
      filterDistanceRangeUnit,
      includeNullInMaxValues,
      includeSecondaryExerciseGroups,
    } = filterValues;

    if (filterMinDate !== null) {
      const filterMinDateString = ConvertCalendarDateToLocalizedString(
        filterMinDate,
        locale
      );

      updatedFilterMap.set("min-date", filterMinDateString);
      storeFilterMap.set("min-date", filterMinDateString);
    }

    if (filterMaxDate !== null) {
      const filterMaxDateString = ConvertCalendarDateToLocalizedString(
        filterMaxDate,
        locale
      );

      updatedFilterMap.set("max-date", filterMaxDateString);
      storeFilterMap.set("max-date", filterMaxDateString);
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

    if (filterRoutines.size > 0 && routineMap !== undefined) {
      updatedFilterMap.set("routines", getFilterRoutinesString(filterRoutines));

      const filterRoutineIdsString = Array.from(filterRoutines).join(",");

      storeFilterMap.set("routines", filterRoutineIdsString);
    }

    if (filterExercises.size > 0 && useExerciseList !== undefined) {
      updatedFilterMap.set(
        "exercises",
        getFilterExercisesString(filterExercises)
      );

      const filterExerciseIdsString = Array.from(filterExercises).join(",");

      storeFilterMap.set("exercises", filterExerciseIdsString);
    }

    if (filterExerciseGroups.length > 0 && useExerciseList !== undefined) {
      updatedFilterMap.set(
        "exercise-groups",
        getFilterExerciseGroupsString(filterExerciseGroups)
      );

      const filterExerciseGroupKeysString = filterExerciseGroups.join(",");

      storeFilterMap.set("exercise-groups", filterExerciseGroupKeysString);
    }

    if (filterMinWeight !== null) {
      const filterMinWeightString = `${filterMinWeight} ${filterWeightRangeUnit}`;

      updatedFilterMap.set("min-weight", filterMinWeightString);
      storeFilterMap.set("min-weight", filterMinWeight);
    }

    if (filterMaxWeight !== null) {
      const filterMaxWeightString = `${filterMaxWeight} ${filterWeightRangeUnit}`;

      updatedFilterMap.set("max-weight", filterMaxWeightString);
      storeFilterMap.set("max-weight", filterMaxWeight);
    }

    if (filterMinDistance !== null) {
      const filterMinDistanceString = `${filterMinDistance} ${filterDistanceRangeUnit}`;

      updatedFilterMap.set("min-distance", filterMinDistanceString);
      storeFilterMap.set("min-distance", filterMinDistance);
    }

    if (filterMaxDistance !== null) {
      const filterMaxDistanceString = `${filterMaxDistance} ${filterDistanceRangeUnit}`;

      updatedFilterMap.set("max-distance", filterMaxDistanceString);
      storeFilterMap.set("max-distance", filterMaxDistance);
    }

    if (filterMeasurements.size > 0) {
      updatedFilterMap.set(
        "measurements",
        getFilterMeasurementsString(filterMeasurements)
      );

      const filterMeasurementIdsString =
        Array.from(filterMeasurements).join(",");

      storeFilterMap.set("measurements", filterMeasurementIdsString);
    }

    if (filterWorkoutTemplates.size > 0 && workoutTemplateMap !== undefined) {
      updatedFilterMap.set(
        "workout-templates",
        getFilterWorkoutTemplatesString(filterWorkoutTemplates)
      );

      const filterWorkoutTemplateIdsString = Array.from(
        filterWorkoutTemplates
      ).join(",");

      storeFilterMap.set("workout-templates", filterWorkoutTemplateIdsString);
    }

    if (filterScheduleTypes.size > 0) {
      const scheduleTypesArray = Array.from(filterScheduleTypes);

      const filterScheduleTypesString = scheduleTypesArray
        .map((item) => item)
        .join(", ");

      updatedFilterMap.set("schedule-type", filterScheduleTypesString);

      const filterScheduleTypesStoreString = scheduleTypesArray.join(",");

      storeFilterMap.set("schedule-type", filterScheduleTypesStoreString);
    }

    if (filterMinNumScheduleDays !== null) {
      const filterMinNumScheduleDaysString = `${filterMinNumScheduleDays} Days`;

      updatedFilterMap.set(
        "min-num-schedule-days",
        filterMinNumScheduleDaysString
      );
      storeFilterMap.set("min-num-schedule-days", filterMinNumScheduleDays);
    }

    if (filterMaxNumScheduleDays !== null) {
      const filterMaxNumScheduleDaysString = `${filterMaxNumScheduleDays} Days`;

      updatedFilterMap.set(
        "max-num-schedule-days",
        filterMaxNumScheduleDaysString
      );
      storeFilterMap.set("max-num-schedule-days", filterMaxNumScheduleDays);
    }

    if (filterWeightUnits.size > 0) {
      const weightUnitsArray = Array.from(filterWeightUnits);

      const filterWeightUnitString = weightUnitsArray
        .map((item) => item)
        .join(", ");

      updatedFilterMap.set("weight-units", filterWeightUnitString);

      const filterWeightUnitsStoreString = weightUnitsArray.join(",");

      storeFilterMap.set("weight-units", filterWeightUnitsStoreString);
    }

    if (filterDistanceUnits.size > 0) {
      const distanceUnitsArray = Array.from(filterDistanceUnits);

      const filterDistanceUnitString = Array.from(distanceUnitsArray)
        .map((item) => item)
        .join(", ");

      updatedFilterMap.set("distance-units", filterDistanceUnitString);

      const filterDistanceUnitsStoreString = distanceUnitsArray.join(",");

      storeFilterMap.set("distance-units", filterDistanceUnitsStoreString);
    }

    if (filterMultisetTypes.size > 0) {
      const multisetTypesArray = Array.from(filterMultisetTypes, Number);

      const filterMultisetTypesString = multisetTypesArray
        .map((type) => multisetTypeMap.get(type) ?? "")
        .join(", ");

      updatedFilterMap.set("multiset-types", filterMultisetTypesString);

      const filterMultisetTypesStoreString = multisetTypesArray.join(",");

      storeFilterMap.set("multiset-types", filterMultisetTypesStoreString);
    }

    if (filterMinBodyFatPercentage !== null) {
      const filterMinBodyFatPercentageString = `${filterMinBodyFatPercentage}%`;

      updatedFilterMap.set("min-bf", filterMinBodyFatPercentageString);
      storeFilterMap.set("min-bf", filterMinBodyFatPercentage);
    }

    if (filterMaxBodyFatPercentage !== null) {
      const filterMaxBodyFatPercentageString = `${filterMaxBodyFatPercentage}%`;

      updatedFilterMap.set("max-bf", filterMaxBodyFatPercentageString);
      storeFilterMap.set("max-bf", filterMaxBodyFatPercentage);
    }

    storeFilterMap.set("weight-range-unit", filterValues.filterWeightRangeUnit);
    storeFilterMap.set(
      "distance-range-unit",
      filterValues.filterDistanceRangeUnit
    );
    storeFilterMap.set("include-null-in-max-values", includeNullInMaxValues);
    storeFilterMap.set(
      "include-secondary-exercise-groups",
      includeSecondaryExerciseGroups
    );

    setFilterMap(updatedFilterMap);
    setListFilterValues(filterValues);
    saveFilterMapToStore(storeFilterMap);

    if (activeModal !== undefined) activeModal.onClose();
  };

  const handleFilterMeasurementTypes = (key: string) => {
    const updatedFilterMap: ListFilterMap = new Map();
    const updatedStoreFilterMap: StoreFilterMap = new Map();
    const updatedListFilterValues = { ...listFilterValues };

    if (listFilterValues.filterMeasurementTypes.has(key)) {
      removeFilter("measurement-types");
      return;
    }

    const updatedFilterMeasurementTypes = new Set<string>([key]);

    updatedListFilterValues.filterMeasurementTypes =
      updatedFilterMeasurementTypes;

    updatedFilterMap.set("measurement-types", key);
    updatedStoreFilterMap.set("measurement-types", key);

    setFilterMap(updatedFilterMap);
    setListFilterValues(updatedListFilterValues);
    saveFilterMapToStore(updatedStoreFilterMap);
  };

  const removeFilter = (key: string) => {
    const updatedFilterMap = new Map(filterMap);
    const updatedStoreFilterMap = new Map(storeFilters.current);
    const updatedListFilterValues = { ...listFilterValues };

    switch (key) {
      case "min-date": {
        updatedListFilterValues.filterMinDate = null;
        break;
      }
      case "max-date": {
        updatedListFilterValues.filterMaxDate = null;
        break;
      }
      case "weekdays": {
        updatedListFilterValues.filterWeekdays = new Set();
        break;
      }
      case "routines": {
        updatedListFilterValues.filterRoutines = new Set();
        break;
      }
      case "exercises": {
        updatedListFilterValues.filterExercises = new Set();
        break;
      }
      case "exercise-groups": {
        updatedListFilterValues.filterExerciseGroups = [];
        break;
      }
      case "min-weight": {
        updatedListFilterValues.filterMinWeight = null;
        break;
      }
      case "max-weight": {
        updatedListFilterValues.filterMaxWeight = null;
        break;
      }
      case "min-distance": {
        updatedListFilterValues.filterMinDistance = null;
        break;
      }
      case "max-distance": {
        updatedListFilterValues.filterMaxDistance = null;
        break;
      }
      case "measurements": {
        updatedListFilterValues.filterMeasurements = new Set();
        break;
      }
      case "measurement-types": {
        updatedListFilterValues.filterMeasurementTypes = new Set();
        break;
      }
      case "workout-templates": {
        updatedListFilterValues.filterWorkoutTemplates = new Set();
        break;
      }
      case "schedule-type": {
        updatedListFilterValues.filterScheduleTypes = new Set();
        break;
      }
      case "min-num-schedule-days": {
        updatedListFilterValues.filterMinNumScheduleDays = null;
        break;
      }
      case "max-num-schedule-days": {
        updatedListFilterValues.filterMaxNumScheduleDays = null;
        break;
      }
      case "weight-units": {
        updatedListFilterValues.filterWeightUnits = new Set();
        break;
      }
      case "distance-units": {
        updatedListFilterValues.filterDistanceUnits = new Set();
        break;
      }
      case "multiset-types": {
        updatedListFilterValues.filterMultisetTypes = new Set();
        break;
      }
      case "min-bf": {
        updatedListFilterValues.filterMinBodyFatPercentage = null;
        break;
      }
      case "max-bf": {
        updatedListFilterValues.filterMaxBodyFatPercentage = null;
        break;
      }
      case "default": {
        return;
      }
    }

    updatedFilterMap.delete(key as ListFilterMapKey);
    updatedStoreFilterMap.delete(key as ListFilterMapKey);

    setFilterMap(updatedFilterMap);
    setListFilterValues(updatedListFilterValues);
    saveFilterMapToStore(updatedStoreFilterMap);
  };

  const resetFilter = () => {
    setFilterMap(new Map());
    setListFilterValues({ ...defaultListFilterValues });
    saveFilterMapToStore(new Map());
  };

  const prefixMap = useMemo(() => {
    const prefixMap: ListFilterMap = new Map();

    prefixMap.set("min-date", `Min Date: `);
    prefixMap.set("max-date", `Max Date: `);
    prefixMap.set(
      "weekdays",
      `Days (${listFilterValues.filterWeekdays.size}): `
    );
    prefixMap.set(
      "routines",
      `Routines (${listFilterValues.filterRoutines.size}): `
    );
    prefixMap.set(
      "exercises",
      `Exercises (${listFilterValues.filterExercises.size}): `
    );
    prefixMap.set(
      "exercise-groups",
      `Exercise Groups (${listFilterValues.filterExerciseGroups.length}): `
    );
    prefixMap.set("min-weight", `Min Weight: `);
    prefixMap.set("max-weight", `Max Weight: `);
    prefixMap.set("min-distance", `Min Distance: `);
    prefixMap.set("max-distance", `Max Distance: `);
    prefixMap.set(
      "measurements",
      `Measurements (${listFilterValues.filterMeasurements.size}): `
    );
    prefixMap.set("measurement-types", `Measurement Type: `);
    prefixMap.set(
      "workout-templates",
      `Templates (${listFilterValues.filterWorkoutTemplates.size}): `
    );
    prefixMap.set(
      "schedule-type",
      `Schedule Type (${listFilterValues.filterScheduleTypes.size}): `
    );
    prefixMap.set("min-num-schedule-days", `Min Number Of Days In Schedule: `);
    prefixMap.set("max-num-schedule-days", `Max Number Of Days In Schedule: `);
    prefixMap.set(
      "weight-units",
      `Weight Unit (${listFilterValues.filterWeightUnits.size}): `
    );
    prefixMap.set(
      "distance-units",
      `Distance Units (${listFilterValues.filterDistanceUnits.size}): `
    );
    prefixMap.set(
      "multiset-types",
      `Multiset Types (${listFilterValues.filterMultisetTypes.size}): `
    );
    prefixMap.set("min-bf", `Min Body Fat Percentage: `);
    prefixMap.set("max-bf", `Max Body Fat Percentage: `);

    return prefixMap;
  }, [
    listFilterValues.filterWeekdays,
    listFilterValues.filterRoutines,
    listFilterValues.filterExercises,
    listFilterValues.filterExerciseGroups,
    listFilterValues.filterMeasurements,
    listFilterValues.filterWorkoutTemplates,
    listFilterValues.filterScheduleTypes,
    listFilterValues.filterWeightUnits,
    listFilterValues.filterDistanceUnits,
    listFilterValues.filterMultisetTypes,
  ]);

  const getFilterRoutinesString = (routineIdSet: Set<number>) => {
    if (routineIdSet.size === 0 || routineMap === undefined)
      return "No Routines Selected";

    const routineNames: string[] = [];

    for (const routineId of routineIdSet) {
      if (routineMap.has(routineId)) {
        const routine = routineMap.get(routineId);
        routineNames.push(routine!.name);
      }
    }

    return routineNames.join(", ");
  };

  const getFilterExercisesString = (exerciseIdSet: Set<number>) => {
    if (exerciseIdSet.size === 0 || useExerciseList === undefined)
      return "No Exercises Selected";

    const exerciseNames: string[] = [];

    for (const exerciseId of exerciseIdSet) {
      if (useExerciseList.exerciseMap.current.has(exerciseId)) {
        const exercise = useExerciseList.exerciseMap.current.get(exerciseId);
        exerciseNames.push(exercise!.name);
      }
    }

    return exerciseNames.join(", ");
  };

  const getFilterExerciseGroupsString = (exerciseGroupList: string[]) => {
    if (exerciseGroupList.length === 0 || useExerciseList === undefined)
      return "No Exercise Groups Selected";

    const exerciseGroupNames: string[] = [];

    for (const group of exerciseGroupList) {
      if (useExerciseList.exerciseGroupDictionary.has(group)) {
        const groupName = useExerciseList.exerciseGroupDictionary.get(group);
        exerciseGroupNames.push(groupName!);
      }
    }

    return exerciseGroupNames.join(", ");
  };

  const getFilterMeasurementsString = (measurementIdSet: Set<string>) => {
    if (measurementIdSet.size === 0 || measurementMap === undefined)
      return "No Measurements Selected";

    const measurementNames: string[] = [];

    for (const measurementId of measurementIdSet) {
      if (measurementMap.has(measurementId.toString())) {
        const measurement = measurementMap.get(measurementId.toString());
        measurementNames.push(measurement!.name);
      }
    }

    return measurementNames.join(", ");
  };

  const getFilterWorkoutTemplatesString = (
    workoutTemplateIdSet: Set<number>
  ) => {
    if (workoutTemplateIdSet.size === 0 || workoutTemplateMap === undefined)
      return "No Workout Templates Selected";

    const workoutTemplateNames: string[] = [];

    for (const workoutTemplateId of workoutTemplateIdSet) {
      if (workoutTemplateMap.has(workoutTemplateId)) {
        const workoutTemplate = workoutTemplateMap.get(workoutTemplateId);
        workoutTemplateNames.push(workoutTemplate!.name);
      }
    }

    return workoutTemplateNames.join(", ");
  };

  // const handleClickRoutine = (routine: Routine) => {
  //   const updatedRoutineSet = new Set(filterRoutines);

  //   if (updatedRoutineSet.has(routine.id)) {
  //     updatedRoutineSet.delete(routine.id);
  //   } else {
  //     updatedRoutineSet.add(routine.id);
  //   }

  //   setFilterRoutines(updatedRoutineSet);
  // };

  // const handleClickExercise = (exercise: Exercise) => {
  //   const updatedExerciseSet = new Set(filterExercises);

  //   if (updatedExerciseSet.has(exercise.id)) {
  //     updatedExerciseSet.delete(exercise.id);
  //   } else {
  //     updatedExerciseSet.add(exercise.id);
  //   }

  //   setFilterExercises(updatedExerciseSet);
  // };

  // const handleClickMeasurement = (measurement: Measurement) => {
  //   const updatedMeasurementSet = new Set(filterMeasurements);

  //   if (updatedMeasurementSet.has(measurement.id.toString())) {
  //     updatedMeasurementSet.delete(measurement.id.toString());
  //   } else {
  //     updatedMeasurementSet.add(measurement.id.toString());
  //   }

  //   setFilterMeasurements(updatedMeasurementSet);
  // };

  // const handleClickWorkoutTemplate = (workoutTemplate: WorkoutTemplate) => {
  //   const updatedWorkoutTemplateSet = new Set(filterWorkoutTemplates);

  //   if (updatedWorkoutTemplateSet.has(workoutTemplate.id)) {
  //     updatedWorkoutTemplateSet.delete(workoutTemplate.id);
  //   } else {
  //     updatedWorkoutTemplateSet.add(workoutTemplate.id);
  //   }

  //   setFilterWorkoutTemplates(updatedWorkoutTemplateSet);
  // };

  const saveFilterMapToStore = async (storeFilterMap: StoreFilterMap) => {
    if (store.current === null) return;

    await store.current.set(`filter-map-${filterMapSuffix}`, {
      value: JSON.stringify(Array.from(storeFilterMap.entries())),
    });

    storeFilters.current = storeFilterMap;
  };

  const loadFilterMapFromStore = async (
    locale: string,
    validFilterKeys: Set<StoreFilterMapKey>
  ) => {
    if (store.current === null) return;

    const val = await store.current.get<{ value: string }>(
      `filter-map-${filterMapSuffix}`
    );

    if (val === undefined) return;

    try {
      const storeFilterList: [StoreFilterMapKey, string | number | boolean][] =
        JSON.parse(val.value);

      if (!Array.isArray(storeFilterList) || storeFilterList.length === 0) {
        handleFilterSaveButton(locale, defaultListFilterValues);
        return;
      }

      const filterStoreValues: ListFilterValues = {
        ...defaultListFilterValues,
      };

      const addedKeys = new Set<StoreFilterMapKey>();

      for (const filter of storeFilterList) {
        const key = filter[0];
        const value = filter[1];

        if (
          key === undefined ||
          value === undefined ||
          addedKeys.has(key) ||
          !validFilterKeys.has(key)
        )
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
          case "exercises": {
            const exercisesString = value as string;

            if (useExerciseList !== undefined) {
              const exercises = await useExerciseList.loadExercisesString(
                exercisesString
              );

              filterStoreValues.filterExercises = exercises;
            }

            break;
          }
          case "exercise-groups": {
            const exerciseGroupsString = value as string;

            if (useExerciseList !== undefined) {
              const exerciseGroups =
                useExerciseList.loadExerciseGroupsString(exerciseGroupsString);

              filterStoreValues.filterExerciseGroups = exerciseGroups;
            }

            break;
          }
          case "min-weight": {
            const minWeight = value as number;

            const minValue = 0;
            const doNotAllowMinValue = true;

            if (IsNumberValid(minWeight, minValue, doNotAllowMinValue)) {
              filterStoreValues.filterMinWeight =
                ConvertNumberToTwoDecimals(minWeight);
            }

            break;
          }
          case "max-weight": {
            const maxWeight = value as number;

            const minValue = filterStoreValues.filterMinWeight ?? 0;
            const doNotAllowMinValue = minValue === 0;

            if (IsNumberValid(maxWeight, minValue, doNotAllowMinValue)) {
              filterStoreValues.filterMaxWeight =
                ConvertNumberToTwoDecimals(maxWeight);
            }

            break;
          }
          case "min-distance": {
            const minDistance = value as number;

            const minValue = 0;
            const doNotAllowMinValue = true;

            if (IsNumberValid(minDistance, minValue, doNotAllowMinValue)) {
              filterStoreValues.filterMinDistance =
                ConvertNumberToTwoDecimals(minDistance);
            }

            break;
          }
          case "max-distance": {
            const maxDistance = value as number;

            const minValue = filterStoreValues.filterMinDistance ?? 0;
            const doNotAllowMinValue = minValue === 0;

            if (IsNumberValid(maxDistance, minValue, doNotAllowMinValue)) {
              filterStoreValues.filterMaxDistance =
                ConvertNumberToTwoDecimals(maxDistance);
            }

            break;
          }
          case "measurement-types": {
            const measurementType = value as string;

            if (MeasurementTypes().includes(measurementType)) {
              handleFilterMeasurementTypes(measurementType);
            }

            // RETURN, NOT BREAK
            return;
          }
          case "min-num-schedule-days": {
            const minNumScheduleDays = value as number;

            const minValue = 2;
            const doNotAllowMinValue = false;
            const maxValue = 14;

            if (
              IsNumberValidInteger(
                minNumScheduleDays,
                minValue,
                doNotAllowMinValue,
                maxValue
              )
            ) {
              filterStoreValues.filterMinNumScheduleDays = minNumScheduleDays;
            }

            break;
          }
          case "max-num-schedule-days": {
            const maxNumScheduleDays = value as number;

            const minValue = filterStoreValues.filterMinNumScheduleDays ?? 2;
            const doNotAllowMinValue = false;
            const maxValue = 14;

            if (
              IsNumberValidInteger(
                maxNumScheduleDays,
                minValue,
                doNotAllowMinValue,
                maxValue
              )
            ) {
              filterStoreValues.filterMaxNumScheduleDays = maxNumScheduleDays;
            }

            break;
          }
          case "min-bf": {
            const minBodyFatPercentage = value as number;

            const minValue = 0;
            const doNotAllowMinValue = true;
            const maxValue = 100;

            if (
              IsNumberValid(
                minBodyFatPercentage,
                minValue,
                doNotAllowMinValue,
                maxValue
              )
            ) {
              filterStoreValues.filterMinBodyFatPercentage =
                ConvertNumberToTwoDecimals(minBodyFatPercentage);
            }

            break;
          }
          case "max-bf": {
            const maxBodyFatPercentage = value as number;

            const minValue = filterStoreValues.filterMinBodyFatPercentage ?? 0;
            const doNotAllowMinValue = minValue === 0;
            const maxValue = 100;

            if (
              IsNumberValidInteger(
                maxBodyFatPercentage,
                minValue,
                doNotAllowMinValue,
                maxValue
              )
            ) {
              filterStoreValues.filterMaxBodyFatPercentage =
                ConvertNumberToTwoDecimals(maxBodyFatPercentage);
            }

            break;
          }
          case "weight-range-unit": {
            const weightUnit = value as string;

            if (ValidWeightUnits().includes(weightUnit)) {
              filterStoreValues.filterWeightRangeUnit = weightUnit;
            }

            break;
          }
          case "distance-range-unit": {
            const distanceUnit = value as string;

            if (ValidDistanceUnits().includes(distanceUnit)) {
              filterStoreValues.filterDistanceRangeUnit = distanceUnit;
            }
            break;
          }
          case "include-null-in-max-values": {
            if (value === true) {
              filterStoreValues.includeNullInMaxValues = true;
            }

            break;
          }
          case "include-secondary-exercise-groups": {
            if (value === true) {
              filterStoreValues.includeSecondaryExerciseGroups = true;
            }

            break;
          }
          default:
            break;
        }
      }

      handleFilterSaveButton(locale, filterStoreValues);
    } catch {
      handleFilterSaveButton(locale, defaultListFilterValues);
    }
  };

  return {
    handleFilterSaveButton,
    filterMap,
    resetFilter,
    removeFilter,
    weekdayMap,
    prefixMap,
    multisetTypeMap,
    handleFilterMeasurementTypes,
    getFilterRoutinesString,
    getFilterExercisesString,
    getFilterExerciseGroupsString,
    getFilterMeasurementsString,
    getFilterWorkoutTemplatesString,
    loadFilterMapFromStore,
    listFilterValues,
  };
};

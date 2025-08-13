import { useMemo, useRef, useState } from "react";
import {
  Exercise,
  ListFilterMap,
  ListFilterMapKey,
  Measurement,
  MeasurementMap,
  Routine,
  RoutineMap,
  StoreRef,
  UseDisclosureReturnType,
  UseExerciseListReturnType,
  UseFilterMinAndMaxValueInputsProps,
  UseFilterMinAndMaxValueInputsReturnType,
  UseListFiltersReturnType,
  WorkoutTemplate,
  WorkoutTemplateMap,
} from "../typings";
import { CalendarDate } from "@heroui/react";
import {
  useWeekdayMap,
  useMultisetTypeMap,
  useIsEndDateBeforeStartDate,
  useFilterMinAndMaxValueInputs,
} from ".";
import {
  ConvertCalendarDateToLocalizedString,
  ConvertDateStringToCalendarDate,
  IsEndDateBeforeStartDate,
  MeasurementTypes,
} from "../helpers";

type UseListFiltersProps = {
  store: StoreRef;
  filterMapSuffix: string;
  useExerciseList?: UseExerciseListReturnType;
  routineMap?: RoutineMap;
  measurementMap?: MeasurementMap;
  workoutTemplateMap?: WorkoutTemplateMap;
  UseFilterMinAndMaxValueInputsProps?: UseFilterMinAndMaxValueInputsProps;
  filterMinAndMaxValueInputsSecondary?: UseFilterMinAndMaxValueInputsReturnType;
};

type FilterStoreValues = {
  storeMinDate?: CalendarDate | null;
  storeMaxDate?: CalendarDate | null;
  storeWeekdays?: Set<string>;
  storeRoutines?: Set<number>;
  storeExercises?: Set<number>;
  storeExerciseGroups?: string[];
  storeMinWeight?: number;
  storeMaxWeight?: number;
  storeMinDistance?: number;
  storeMaxDistance?: number;
  storeMeasurements?: Set<string>;
  storeMeasurementTypes?: Set<string>;
  storeWorkoutTemplates?: Set<number>;
  storeScheduleTypes?: Set<string>;
  storeMinNumScheduleDays?: number;
  storeMaxNumScheduleDays?: number;
  storeWeightUnits?: Set<string>;
  storeDistanceUnits?: Set<string>;
  storeMultisetTypes?: Set<string>;
  storeMinBodyFatPercentage?: number;
  storeMaxBodyFatPercentage?: number;
  storeWeightRangeUnit?: string;
  storeDistanceRangeUnit?: string;
};

type StoreFilterMap = Map<ListFilterMapKey, string | number | boolean>;

export const useListFilters = ({
  store,
  filterMapSuffix,
  useExerciseList,
  routineMap,
  measurementMap,
  workoutTemplateMap,
  UseFilterMinAndMaxValueInputsProps,
  filterMinAndMaxValueInputsSecondary,
}: UseListFiltersProps): UseListFiltersReturnType => {
  const [filterMap, setFilterMap] = useState<ListFilterMap>(new Map());
  const [filterMinDate, setFilterMinDate] = useState<CalendarDate | null>(null);
  const [filterMaxDate, setFilterMaxDate] = useState<CalendarDate | null>(null);
  const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(new Set());
  const [filterRoutines, setFilterRoutines] = useState<Set<number>>(new Set());
  const [filterExercises, setFilterExercises] = useState<Set<number>>(
    new Set()
  );
  const [filterExerciseGroups, setFilterExerciseGroups] = useState<string[]>(
    []
  );
  const [filterMinWeight, setFilterMinWeight] = useState<number | null>(null);
  const [filterMaxWeight, setFilterMaxWeight] = useState<number | null>(null);
  const [filterMinDistance, setFilterMinDistance] = useState<number | null>(
    null
  );
  const [filterMaxDistance, setFilterMaxDistance] = useState<number | null>(
    null
  );
  const [filterMeasurements, setFilterMeasurements] = useState<Set<string>>(
    new Set()
  );
  const [filterMeasurementTypes, setFilterMeasurementTypes] = useState<
    Set<string>
  >(new Set());
  const [filterWorkoutTemplates, setFilterWorkoutTemplates] = useState<
    Set<number>
  >(new Set());
  const [filterScheduleTypes, setFilterScheduleTypes] = useState<Set<string>>(
    new Set()
  );
  const [filterMinNumScheduleDays, setFilterMinNumScheduleDays] = useState<
    number | null
  >(null);
  const [filterMaxNumScheduleDays, setFilterMaxNumScheduleDays] = useState<
    number | null
  >(null);
  const [filterWeightUnits, setFilterWeightUnits] = useState<Set<string>>(
    new Set()
  );
  const [filterDistanceUnits, setFilterDistanceUnits] = useState<Set<string>>(
    new Set()
  );
  const [filterMultisetTypes, setFilterMultisetTypes] = useState<Set<string>>(
    new Set()
  );
  const [filterMinBodyFatPercentage, setFilterMinBodyFatPercentage] = useState<
    number | null
  >(null);
  const [filterMaxBodyFatPercentage, setFilterMaxBodyFatPercentage] = useState<
    number | null
  >(null);

  const [filterWeightRangeUnit, setFilterWeightRangeUnit] =
    useState<string>("kg");
  const [filterDistanceRangeUnit, setFilterDistanceRangeUnit] =
    useState<string>("km");

  const weekdayMap = useWeekdayMap();

  const multisetTypeMap = useMultisetTypeMap();

  const isMaxDateBeforeMinDate = useIsEndDateBeforeStartDate({
    startDate: filterMinDate,
    endDate: filterMaxDate,
  });

  const filterMinAndMaxValueInputs = useFilterMinAndMaxValueInputs(
    UseFilterMinAndMaxValueInputsProps
  );

  const [includeNullInMaxValues, setIncludeNullInMaxValues] =
    useState<boolean>(false);

  const storeFilters = useRef<StoreFilterMap>(new Map());

  const handleFilterSaveButton = (
    locale: string,
    activeModal?: UseDisclosureReturnType,
    filterStoreValues?: FilterStoreValues
  ) => {
    const updatedFilterMap: ListFilterMap = new Map();
    const storeFilterMap: StoreFilterMap = new Map();

    const minDate = filterStoreValues?.storeMinDate ?? filterMinDate;
    if (minDate !== null) {
      const filterMinDateString = ConvertCalendarDateToLocalizedString(
        minDate,
        locale
      );

      updatedFilterMap.set("min-date", filterMinDateString);
      storeFilterMap.set("min-date", filterMinDateString);
    }

    const maxDate = filterStoreValues?.storeMaxDate ?? filterMaxDate;
    if (maxDate !== null) {
      const filterMaxDateString = ConvertCalendarDateToLocalizedString(
        maxDate,
        locale
      );

      updatedFilterMap.set("max-date", filterMaxDateString);
      storeFilterMap.set("max-date", filterMaxDateString);
    }

    const weekdays = filterStoreValues?.storeWeekdays ?? filterWeekdays;
    if (weekdays.size > 0) {
      const weekdaysArray = Array.from(weekdays);

      const filterWeekdaysString = weekdaysArray
        .map((day) => (weekdayMap.get(day) ?? "").substring(0, 3))
        .join(", ");

      updatedFilterMap.set("weekdays", filterWeekdaysString);

      const storeWeekdaysString = weekdaysArray.join(",");

      storeFilterMap.set("weekdays", storeWeekdaysString);
    }

    const routines = filterStoreValues?.storeRoutines ?? filterRoutines;
    if (routines.size > 0 && routineMap !== undefined) {
      updatedFilterMap.set("routines", getFilterRoutinesString(routines));
    }

    const exercises = filterStoreValues?.storeExercises ?? filterExercises;
    if (exercises.size > 0 && useExerciseList !== undefined) {
      updatedFilterMap.set("exercises", getFilterExercisesString(exercises));
    }

    const exerciseGroups =
      filterStoreValues?.storeExerciseGroups ?? filterExerciseGroups;
    if (exerciseGroups.length > 0 && useExerciseList !== undefined) {
      updatedFilterMap.set(
        "exercise-groups",
        getFilterExerciseGroupsString(exerciseGroups)
      );
    }

    const weightRangeUnit =
      filterStoreValues?.storeWeightRangeUnit ?? filterWeightRangeUnit;

    const minWeight = filterStoreValues?.storeMinWeight ?? filterMinWeight;
    if (minWeight !== null) {
      const filterMinWeightString = `${minWeight} ${weightRangeUnit}`;

      updatedFilterMap.set("min-weight", filterMinWeightString);
    }

    const maxWeight = filterStoreValues?.storeMaxWeight ?? filterMaxWeight;
    if (maxWeight !== null) {
      const filterMaxWeightString = `${maxWeight} ${weightRangeUnit}`;

      updatedFilterMap.set("max-weight", filterMaxWeightString);
    }

    const distanceRangeUnit =
      filterStoreValues?.storeDistanceRangeUnit ?? filterDistanceRangeUnit;

    const minDistance =
      filterStoreValues?.storeMinDistance ?? filterMinDistance;
    if (minDistance !== null) {
      const filterMinDistanceString = `${minDistance} ${distanceRangeUnit}`;

      updatedFilterMap.set("min-distance", filterMinDistanceString);
    }

    const maxDistance =
      filterStoreValues?.storeMaxDistance ?? filterMaxDistance;
    if (maxDistance !== null) {
      const filterMaxDistanceString = `${maxDistance} ${distanceRangeUnit}`;

      updatedFilterMap.set("max-distance", filterMaxDistanceString);
    }

    const measurements =
      filterStoreValues?.storeMeasurements ?? filterMeasurements;
    if (measurements.size > 0) {
      updatedFilterMap.set(
        "measurements",
        getFilterMeasurementsString(measurements)
      );
    }

    const workoutTemplates =
      filterStoreValues?.storeWorkoutTemplates ?? filterWorkoutTemplates;
    if (workoutTemplates.size > 0 && workoutTemplateMap !== undefined) {
      updatedFilterMap.set(
        "workout-templates",
        getFilterWorkoutTemplatesString(workoutTemplates)
      );
    }

    const scheduleTypes =
      filterStoreValues?.storeScheduleTypes ?? filterScheduleTypes;
    if (scheduleTypes.size > 0) {
      const scheduleTypesArray = Array.from(scheduleTypes);

      const filterScheduleTypesString = scheduleTypesArray
        .map((item) => item)
        .join(", ");
      updatedFilterMap.set("schedule-type", filterScheduleTypesString);
    }

    const minNumScheduleDays =
      filterStoreValues?.storeMinNumScheduleDays ?? filterMinNumScheduleDays;
    if (minNumScheduleDays !== null) {
      const filterMinNumScheduleDaysString = `${minNumScheduleDays} Days`;

      updatedFilterMap.set(
        "min-num-schedule-days",
        filterMinNumScheduleDaysString
      );
    }

    const maxNumScheduleDays =
      filterStoreValues?.storeMaxNumScheduleDays ?? filterMaxNumScheduleDays;
    if (maxNumScheduleDays !== null) {
      const filterMaxNumScheduleDaysString = `${maxNumScheduleDays} Days`;

      updatedFilterMap.set(
        "max-num-schedule-days",
        filterMaxNumScheduleDaysString
      );
    }

    const weightUnits =
      filterStoreValues?.storeWeightUnits ?? filterWeightUnits;
    if (weightUnits.size > 0) {
      const weightUnitsArray = Array.from(weightUnits);

      const filterWeightUnitString = weightUnitsArray
        .map((item) => item)
        .join(", ");
      updatedFilterMap.set("weight-units", filterWeightUnitString);
    }

    const distanceUnits =
      filterStoreValues?.storeDistanceUnits ?? filterDistanceUnits;
    if (distanceUnits.size > 0) {
      const distanceUnitsArray = Array.from(distanceUnits);

      const filterDistanceUnitString = Array.from(distanceUnitsArray)
        .map((item) => item)
        .join(", ");
      updatedFilterMap.set("distance-units", filterDistanceUnitString);
    }

    const multisetTypes =
      filterStoreValues?.storeMultisetTypes ?? filterMultisetTypes;
    if (multisetTypes.size > 0) {
      const multisetTypesArray = Array.from(multisetTypes);

      const filterMultisetTypesString = multisetTypesArray
        .map((type) => multisetTypeMap.get(Number(type)) ?? "")
        .join(", ");

      updatedFilterMap.set("multiset-types", filterMultisetTypesString);
    }

    const minBodyFatPercentage =
      filterStoreValues?.storeMinBodyFatPercentage ??
      filterMinBodyFatPercentage;
    if (minBodyFatPercentage !== null) {
      const filterMinBodyFatPercentageString = `${minBodyFatPercentage}%`;

      updatedFilterMap.set("min-bf", filterMinBodyFatPercentageString);
    }

    const maxBodyFatPercentage =
      filterStoreValues?.storeMaxBodyFatPercentage ??
      filterMaxBodyFatPercentage;
    if (maxBodyFatPercentage !== null) {
      const filterMaxBodyFatPercentageString = `${maxBodyFatPercentage}%`;

      updatedFilterMap.set("max-bf", filterMaxBodyFatPercentageString);
    }

    setFilterMap(updatedFilterMap);

    saveFilterMapToStore(storeFilterMap);

    if (activeModal !== undefined) activeModal.onClose();
  };

  const handleFilterMeasurementTypes = (key: string) => {
    const updatedFilterMap: ListFilterMap = new Map();
    const updatedStoreFilterMap: StoreFilterMap = new Map();

    const updatedFilterMeasurementTypes = new Set<string>();

    if (filterMeasurementTypes.has(key)) {
      removeFilter("measurement-types");
    } else {
      updatedFilterMeasurementTypes.add(key);
    }

    if (updatedFilterMeasurementTypes.size > 0) {
      updatedFilterMap.set("measurement-types", key);
      updatedStoreFilterMap.set("measurement-types", key);

      saveFilterMapToStore(updatedStoreFilterMap);
    }

    setFilterMeasurementTypes(updatedFilterMeasurementTypes);
    setFilterMap(updatedFilterMap);
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
      case "routines": {
        setFilterRoutines(new Set());
        break;
      }
      case "exercises": {
        setFilterExercises(new Set());
        break;
      }
      case "exercise-groups": {
        setFilterExerciseGroups([]);
        break;
      }
      case "min-weight": {
        setFilterMinWeight(null);
        filterMinAndMaxValueInputs.resetMinInput();
        break;
      }
      case "max-weight": {
        setFilterMaxWeight(null);
        filterMinAndMaxValueInputs.resetMaxInput();
        break;
      }
      case "min-distance": {
        setFilterMinDistance(null);
        filterMinAndMaxValueInputs.resetMinInput();
        break;
      }
      case "max-distance": {
        setFilterMaxDistance(null);
        filterMinAndMaxValueInputs.resetMaxInput();
        break;
      }
      case "measurements": {
        setFilterMeasurements(new Set());
        break;
      }
      case "measurement-types": {
        setFilterMeasurementTypes(new Set());
        break;
      }
      case "workout-templates": {
        setFilterWorkoutTemplates(new Set());
        break;
      }
      case "schedule-type": {
        setFilterScheduleTypes(new Set());
        break;
      }
      case "min-num-schedule-days": {
        setFilterMinNumScheduleDays(null);
        filterMinAndMaxValueInputs.resetMinInput();
        break;
      }
      case "max-num-schedule-days": {
        setFilterMaxNumScheduleDays(null);
        filterMinAndMaxValueInputs.resetMaxInput();
        break;
      }
      case "weight-units": {
        setFilterWeightUnits(new Set());
        break;
      }
      case "distance-units": {
        setFilterDistanceUnits(new Set());
        break;
      }
      case "multiset-types": {
        setFilterMultisetTypes(new Set());
        break;
      }
      case "min-bf": {
        setFilterMinBodyFatPercentage(null);
        if (filterMinAndMaxValueInputsSecondary !== undefined) {
          filterMinAndMaxValueInputsSecondary.resetMinInput();
        }
        break;
      }
      case "max-bf": {
        setFilterMaxBodyFatPercentage(null);
        if (filterMinAndMaxValueInputsSecondary !== undefined) {
          filterMinAndMaxValueInputsSecondary.resetMaxInput();
        }
        break;
      }
      case "default": {
        return;
      }
    }

    updatedFilterMap.delete(key as ListFilterMapKey);
    updatedStoreFilterMap.delete(key as ListFilterMapKey);

    setFilterMap(updatedFilterMap);

    saveFilterMapToStore(updatedStoreFilterMap);
  };

  const resetFilter = () => {
    setFilterMap(new Map());
    setFilterMinDate(null);
    setFilterMaxDate(null);
    setFilterWeekdays(new Set());
    setFilterRoutines(new Set());
    setFilterExercises(new Set());
    setFilterExerciseGroups([]);
    setFilterMinWeight(null);
    setFilterMaxWeight(null);
    setFilterMinDistance(null);
    setFilterMaxDistance(null);
    setFilterMeasurements(new Set());
    setFilterMeasurementTypes(new Set());
    setFilterWorkoutTemplates(new Set());
    setFilterScheduleTypes(new Set());
    setFilterMinNumScheduleDays(null);
    setFilterMaxNumScheduleDays(null);
    setFilterWeightUnits(new Set());
    setFilterDistanceUnits(new Set());
    setFilterMultisetTypes(new Set());
    setFilterMinBodyFatPercentage(null);
    setFilterMaxBodyFatPercentage(null);
    filterMinAndMaxValueInputs.resetInputs();

    if (filterMinAndMaxValueInputsSecondary !== undefined) {
      filterMinAndMaxValueInputsSecondary.resetInputs();
    }

    saveFilterMapToStore(new Map());
  };

  const showResetFilterButton = useMemo(() => {
    if (filterMap.size > 0) return true;
    if (filterMinDate !== null) return true;
    if (filterMaxDate !== null) return true;
    if (filterWeekdays.size > 0) return true;
    if (filterRoutines.size > 0) return true;
    if (filterExercises.size > 0) return true;
    if (filterExerciseGroups.length > 0) return true;
    if (filterMinWeight !== null) return true;
    if (filterMaxWeight !== null) return true;
    if (filterMinDistance !== null) return true;
    if (filterMaxDistance !== null) return true;
    if (filterMeasurements.size > 0) return true;
    if (filterMeasurementTypes.size > 0) return true;
    if (filterWorkoutTemplates.size > 0) return true;
    if (filterScheduleTypes.size > 0) return true;
    if (filterMinNumScheduleDays !== null) return true;
    if (filterMaxNumScheduleDays !== null) return true;
    if (filterWeightUnits.size > 0) return true;
    if (filterDistanceUnits.size > 0) return true;
    if (filterMultisetTypes.size > 0) return true;
    if (filterMinBodyFatPercentage !== null) return true;
    if (filterMaxBodyFatPercentage !== null) return true;

    return false;
  }, [
    filterMap,
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
    filterMeasurementTypes,
    filterWorkoutTemplates,
    filterScheduleTypes,
    filterMinNumScheduleDays,
    filterMaxNumScheduleDays,
    filterWeightUnits,
    filterDistanceUnits,
    filterMultisetTypes,
    filterMinBodyFatPercentage,
    filterMaxBodyFatPercentage,
  ]);

  const prefixMap = useMemo(() => {
    const prefixMap: ListFilterMap = new Map();

    prefixMap.set("min-date", `Min Date: `);
    prefixMap.set("max-date", `Max Date: `);
    prefixMap.set("weekdays", `Days (${filterWeekdays.size}): `);
    prefixMap.set("routines", `Routines (${filterRoutines.size}): `);
    prefixMap.set("exercises", `Exercises (${filterExercises.size}): `);
    prefixMap.set(
      "exercise-groups",
      `Exercise Groups (${filterExerciseGroups.length}): `
    );
    prefixMap.set("min-weight", `Min Weight: `);
    prefixMap.set("max-weight", `Max Weight: `);
    prefixMap.set("min-distance", `Min Distance: `);
    prefixMap.set("max-distance", `Max Distance: `);
    prefixMap.set(
      "measurements",
      `Measurements (${filterMeasurements.size}): `
    );
    prefixMap.set("measurement-types", `Measurement Type: `);
    prefixMap.set(
      "workout-templates",
      `Templates (${filterWorkoutTemplates.size}): `
    );
    prefixMap.set(
      "schedule-type",
      `Schedule Type (${filterScheduleTypes.size}): `
    );
    prefixMap.set("min-num-schedule-days", `Min Number Of Days In Schedule: `);
    prefixMap.set("max-num-schedule-days", `Max Number Of Days In Schedule: `);
    prefixMap.set("weight-units", `Weight Unit (${filterWeightUnits.size}): `);
    prefixMap.set(
      "distance-units",
      `Distance Units (${filterDistanceUnits.size}): `
    );
    prefixMap.set(
      "multiset-types",
      `Multiset Types (${filterMultisetTypes.size}): `
    );
    prefixMap.set("min-bf", `Min Body Fat Percentage: `);
    prefixMap.set("max-bf", `Max Body Fat Percentage: `);

    return prefixMap;
  }, [
    filterWeekdays,
    filterRoutines,
    filterExercises,
    filterExerciseGroups,
    filterMeasurements,
    filterWorkoutTemplates,
    filterScheduleTypes,
    filterWeightUnits,
    filterDistanceUnits,
    filterMultisetTypes,
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

  const handleClickRoutine = (routine: Routine) => {
    const updatedRoutineSet = new Set(filterRoutines);

    if (updatedRoutineSet.has(routine.id)) {
      updatedRoutineSet.delete(routine.id);
    } else {
      updatedRoutineSet.add(routine.id);
    }

    setFilterRoutines(updatedRoutineSet);
  };

  const handleClickExercise = (exercise: Exercise) => {
    const updatedExerciseSet = new Set(filterExercises);

    if (updatedExerciseSet.has(exercise.id)) {
      updatedExerciseSet.delete(exercise.id);
    } else {
      updatedExerciseSet.add(exercise.id);
    }

    setFilterExercises(updatedExerciseSet);
  };

  const handleClickMeasurement = (measurement: Measurement) => {
    const updatedMeasurementSet = new Set(filterMeasurements);

    if (updatedMeasurementSet.has(measurement.id.toString())) {
      updatedMeasurementSet.delete(measurement.id.toString());
    } else {
      updatedMeasurementSet.add(measurement.id.toString());
    }

    setFilterMeasurements(updatedMeasurementSet);
  };

  const handleClickWorkoutTemplate = (workoutTemplate: WorkoutTemplate) => {
    const updatedWorkoutTemplateSet = new Set(filterWorkoutTemplates);

    if (updatedWorkoutTemplateSet.has(workoutTemplate.id)) {
      updatedWorkoutTemplateSet.delete(workoutTemplate.id);
    } else {
      updatedWorkoutTemplateSet.add(workoutTemplate.id);
    }

    setFilterWorkoutTemplates(updatedWorkoutTemplateSet);
  };

  const saveFilterMapToStore = async (storeFilterMap: StoreFilterMap) => {
    if (store.current === null) return;

    await store.current.set(`filter-map-${filterMapSuffix}`, {
      value: JSON.stringify(Array.from(storeFilterMap.entries())),
    });

    storeFilters.current = storeFilterMap;
  };

  const loadFilterMapFromStore = async (
    locale: string,
    validFilterKeys: Set<ListFilterMapKey>
  ) => {
    if (store.current === null) return;

    const val = await store.current.get<{ value: string }>(
      `filter-map-${filterMapSuffix}`
    );

    if (val === undefined) return;

    try {
      const storeFilterList: [ListFilterMapKey, string | number][] = JSON.parse(
        val.value
      );

      if (!Array.isArray(storeFilterList) || storeFilterList.length === 0) {
        handleFilterSaveButton(locale);
        return;
      }

      const filterStoreValues: FilterStoreValues = {};

      const addedKeys = new Set<ListFilterMapKey>();

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
            filterStoreValues.storeWeekdays = weekdaysSet;

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
          default:
            break;
        }
      }

      handleFilterSaveButton(locale, undefined, filterStoreValues);
    } catch {
      handleFilterSaveButton(locale);
    }
  };

  return {
    handleFilterSaveButton,
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
    filterMinWeight,
    setFilterMinWeight,
    filterMaxWeight,
    setFilterMaxWeight,
    filterMinDistance,
    setFilterMinDistance,
    filterMaxDistance,
    setFilterMaxDistance,
    filterWeightRangeUnit,
    setFilterWeightRangeUnit,
    filterMeasurements,
    setFilterMeasurements,
    filterMeasurementTypes,
    setFilterMeasurementTypes,
    handleFilterMeasurementTypes,
    filterWorkoutTemplates,
    setFilterWorkoutTemplates,
    getFilterRoutinesString,
    getFilterExercisesString,
    getFilterExerciseGroupsString,
    getFilterMeasurementsString,
    getFilterWorkoutTemplatesString,
    handleClickRoutine,
    handleClickExercise,
    handleClickMeasurement,
    handleClickWorkoutTemplate,
    filterScheduleTypes,
    setFilterScheduleTypes,
    filterMinNumScheduleDays,
    setFilterMinNumScheduleDays,
    filterMaxNumScheduleDays,
    setFilterMaxNumScheduleDays,
    filterWeightUnits,
    setFilterWeightUnits,
    filterDistanceRangeUnit,
    setFilterDistanceRangeUnit,
    filterDistanceUnits,
    setFilterDistanceUnits,
    multisetTypeMap,
    filterMultisetTypes,
    setFilterMultisetTypes,
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    isMaxDateBeforeMinDate,
    filterMinAndMaxValueInputs,
    includeNullInMaxValues,
    setIncludeNullInMaxValues,
    filterMinBodyFatPercentage,
    setFilterMinBodyFatPercentage,
    filterMaxBodyFatPercentage,
    setFilterMaxBodyFatPercentage,
    loadFilterMapFromStore,
  };
};

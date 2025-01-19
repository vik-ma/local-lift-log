import { useMemo, useState } from "react";
import {
  Exercise,
  ListFilterMapKey,
  Measurement,
  MeasurementMap,
  Routine,
  RoutineMap,
  UseDisclosureReturnType,
  UseExerciseListReturnType,
  UseFilterMinAndMaxValueInputsArgs,
  UseFilterMinAndMaxValueInputsReturnType,
  UseListFiltersReturnType,
  WorkoutTemplate,
  WorkoutTemplateMap,
} from "../typings";
import { CalendarDate } from "@nextui-org/react";
import {
  useWeekdayMap,
  useMultisetTypeMap,
  useIsEndDateBeforeStartDate,
  useFilterMinAndMaxValueInputs,
} from ".";
import { ConvertCalendarDateToLocalizedString } from "../helpers";

export const useListFilters = (
  useExerciseList?: UseExerciseListReturnType,
  routineMap?: RoutineMap,
  measurementMap?: MeasurementMap,
  workoutTemplateMap?: WorkoutTemplateMap,
  useFilterMinAndMaxValueInputsArgs?: UseFilterMinAndMaxValueInputsArgs,
  filterMinAndMaxValueInputsSecondary?: UseFilterMinAndMaxValueInputsReturnType
): UseListFiltersReturnType => {
  const [filterMap, setFilterMap] = useState<Map<ListFilterMapKey, string>>(
    new Map()
  );
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
  const [filterWorkoutTemplates, setFilterWorkoutTemplates] = useState<
    Set<number>
  >(new Set());
  const [filterMinDate, setFilterMinDate] = useState<CalendarDate | null>(null);
  const [filterMaxDate, setFilterMaxDate] = useState<CalendarDate | null>(null);

  const weekdayMap = useWeekdayMap();

  const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(new Set());

  const [filterMinWeight, setFilterMinWeight] = useState<number | null>(null);
  const [filterMaxWeight, setFilterMaxWeight] = useState<number | null>(null);
  const [filterMinDistance, setFilterMinDistance] = useState<number | null>(
    null
  );
  const [filterMaxDistance, setFilterMaxDistance] = useState<number | null>(
    null
  );

  const [filterWeightRangeUnit, setFilterWeightRangeUnit] =
    useState<string>("kg");
  const [filterDistanceRangeUnit, setFilterDistanceRangeUnit] =
    useState<string>("km");

  const [filterScheduleTypes, setFilterScheduleTypes] = useState<Set<string>>(
    new Set()
  );

  const [filterMeasurementTypes, setFilterMeasurementTypes] = useState<
    Set<string>
  >(new Set());

  const [filterWeightUnits, setFilterWeightUnits] = useState<Set<string>>(
    new Set()
  );

  const [filterDistanceUnits, setFilterDistanceUnits] = useState<Set<string>>(
    new Set()
  );

  const multisetTypeMap = useMultisetTypeMap();

  const [filterMultisetTypes, setFilterMultisetTypes] = useState<Set<string>>(
    new Set()
  );

  const isMaxDateBeforeMinDate = useIsEndDateBeforeStartDate(
    filterMinDate,
    filterMaxDate
  );

  const [filterMinNumScheduleDays, setFilterMinNumScheduleDays] = useState<
    number | null
  >(null);
  const [filterMaxNumScheduleDays, setFilterMaxNumScheduleDays] = useState<
    number | null
  >(null);

  const filterMinAndMaxValueInputs = useFilterMinAndMaxValueInputs(
    useFilterMinAndMaxValueInputsArgs
  );

  const [includeNullInMaxValues, setIncludeNullInMaxValues] =
    useState<boolean>(false);

  const [filterMinBodyFatPercentage, setFilterMinBodyFatPercentage] = useState<
    number | null
  >(null);
  const [filterMaxBodyFatPercentage, setFilterMaxBodyFatPercentage] = useState<
    number | null
  >(null);

  const handleFilterSaveButton = (
    locale: string,
    activeModal: UseDisclosureReturnType
  ) => {
    const updatedFilterMap = new Map<ListFilterMapKey, string>();

    if (filterMinDate !== null) {
      const filterMinDateString = ConvertCalendarDateToLocalizedString(
        filterMinDate,
        locale
      );

      updatedFilterMap.set("min-date", filterMinDateString);
    }

    if (filterMaxDate !== null) {
      const filterMaxDateString = ConvertCalendarDateToLocalizedString(
        filterMaxDate,
        locale
      );

      updatedFilterMap.set("max-date", filterMaxDateString);
    }

    if (filterWeekdays.size > 0) {
      const filterWeekdaysString = Array.from(filterWeekdays)
        .map((day) => (weekdayMap.get(day) ?? "").substring(0, 3))
        .join(", ");

      updatedFilterMap.set("weekdays", filterWeekdaysString);
    }

    if (filterRoutines.size > 0 && routineMap !== undefined) {
      updatedFilterMap.set("routines", filterRoutinesString);
    }

    if (filterExercises.size > 0 && useExerciseList !== undefined) {
      updatedFilterMap.set("exercises", filterExercisesString);
    }

    if (filterExerciseGroups.length > 0 && useExerciseList !== undefined) {
      updatedFilterMap.set("exercise-groups", filterExerciseGroupsString);
    }

    if (filterMinWeight !== null) {
      const filterMinWeightString = `${filterMinWeight} ${filterWeightRangeUnit}`;

      updatedFilterMap.set("min-weight", filterMinWeightString);
    }

    if (filterMaxWeight !== null) {
      const filterMaxWeightString = `${filterMaxWeight} ${filterWeightRangeUnit}`;

      updatedFilterMap.set("max-weight", filterMaxWeightString);
    }

    if (filterMinDistance !== null) {
      const filterMinDistanceString = `${filterMinDistance} ${filterDistanceRangeUnit}`;

      updatedFilterMap.set("min-distance", filterMinDistanceString);
    }

    if (filterMaxDistance !== null) {
      const filterMaxDistanceString = `${filterMaxDistance} ${filterDistanceRangeUnit}`;

      updatedFilterMap.set("max-distance", filterMaxDistanceString);
    }

    if (filterMeasurements.size > 0) {
      updatedFilterMap.set("measurements", filterMeasurementsString);
    }

    if (filterWorkoutTemplates.size > 0 && workoutTemplateMap !== undefined) {
      updatedFilterMap.set("workout-templates", filterWorkoutTemplatesString);
    }

    if (filterScheduleTypes.size > 0) {
      const filterScheduleTypesString = Array.from(filterScheduleTypes)
        .map((item) => item)
        .join(", ");
      updatedFilterMap.set("schedule-type", filterScheduleTypesString);
    }

    if (filterMinNumScheduleDays !== null) {
      const filterMinNumScheduleDaysString = `${filterMinNumScheduleDays} Days`;

      updatedFilterMap.set(
        "min-num-schedule-days",
        filterMinNumScheduleDaysString
      );
    }

    if (filterMaxNumScheduleDays !== null) {
      const filterMaxNumScheduleDaysString = `${filterMaxNumScheduleDays} Days`;

      updatedFilterMap.set(
        "max-num-schedule-days",
        filterMaxNumScheduleDaysString
      );
    }

    if (filterWeightUnits.size > 0) {
      const filterWeightUnitString = Array.from(filterWeightUnits)
        .map((item) => item)
        .join(", ");
      updatedFilterMap.set("weight-units", filterWeightUnitString);
    }

    if (filterDistanceUnits.size > 0) {
      const filterDistanceUnitString = Array.from(filterDistanceUnits)
        .map((item) => item)
        .join(", ");
      updatedFilterMap.set("distance-units", filterDistanceUnitString);
    }

    if (filterMultisetTypes.size > 0) {
      const filterMultisetTypesString = Array.from(filterMultisetTypes)
        .map((type) => multisetTypeMap.get(Number(type)) ?? "")
        .join(", ");

      updatedFilterMap.set("multiset-types", filterMultisetTypesString);
    }

    if (filterMinBodyFatPercentage !== null) {
      const filterMinBodyFatPercentageString = `${filterMinBodyFatPercentage}%`;

      updatedFilterMap.set("min-bf", filterMinBodyFatPercentageString);
    }

    if (filterMaxBodyFatPercentage !== null) {
      const filterMaxBodyFatPercentageString = `${filterMaxBodyFatPercentage}%`;

      updatedFilterMap.set("max-bf", filterMaxBodyFatPercentageString);
    }

    setFilterMap(updatedFilterMap);

    activeModal.onClose();
  };

  const handleFilterMeasurementTypes = (key: string) => {
    const updatedFilterMap = new Map<ListFilterMapKey, string>();

    const updatedFilterMeasurementTypes = new Set<string>();

    if (filterMeasurementTypes.has(key)) {
      removeFilter("measurement-types");
    } else {
      updatedFilterMeasurementTypes.add(key);
    }

    if (updatedFilterMeasurementTypes.size > 0) {
      updatedFilterMap.set("measurement-types", key);
    }

    setFilterMeasurementTypes(updatedFilterMeasurementTypes);
    setFilterMap(updatedFilterMap);
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

    if (key === "min-weight" && filterMap.has("min-weight")) {
      updatedFilterMap.delete("min-weight");
      setFilterMinWeight(null);
      filterMinAndMaxValueInputs.resetMinInput();
    }

    if (key === "max-weight" && filterMap.has("max-weight")) {
      updatedFilterMap.delete("max-weight");
      setFilterMaxWeight(null);
      filterMinAndMaxValueInputs.resetMaxInput();
    }

    if (key === "min-distance" && filterMap.has("min-distance")) {
      updatedFilterMap.delete("min-distance");
      setFilterMinDistance(null);
      filterMinAndMaxValueInputs.resetMinInput();
    }

    if (key === "max-distance" && filterMap.has("max-distance")) {
      updatedFilterMap.delete("max-distance");
      setFilterMaxDistance(null);
      filterMinAndMaxValueInputs.resetMaxInput();
    }

    if (key === "measurements" && filterMap.has("measurements")) {
      updatedFilterMap.delete("measurements");
      setFilterMeasurements(new Set());
    }

    if (key === "measurement-types" && filterMap.has("measurement-types")) {
      updatedFilterMap.delete("measurement-types");
      setFilterMeasurementTypes(new Set());
    }

    if (key === "workout-templates" && filterMap.has("workout-templates")) {
      updatedFilterMap.delete("workout-templates");
      setFilterWorkoutTemplates(new Set());
    }

    if (key === "schedule-type" && filterMap.has("schedule-type")) {
      updatedFilterMap.delete("schedule-type");
      setFilterScheduleTypes(new Set());
    }

    if (
      key === "min-num-schedule-days" &&
      filterMap.has("min-num-schedule-days")
    ) {
      updatedFilterMap.delete("min-num-schedule-days");
      setFilterMinNumScheduleDays(null);
      filterMinAndMaxValueInputs.resetMinInput();
    }

    if (
      key === "max-num-schedule-days" &&
      filterMap.has("max-num-schedule-days")
    ) {
      updatedFilterMap.delete("max-num-schedule-days");
      setFilterMaxNumScheduleDays(null);
      filterMinAndMaxValueInputs.resetMaxInput();
    }

    if (key === "weight-units" && filterMap.has("weight-units")) {
      updatedFilterMap.delete("weight-units");
      setFilterWeightUnits(new Set());
    }

    if (key === "distance-units" && filterMap.has("distance-units")) {
      updatedFilterMap.delete("distance-units");
      setFilterDistanceUnits(new Set());
    }

    if (key === "multiset-types" && filterMap.has("multiset-types")) {
      updatedFilterMap.delete("multiset-types");
      setFilterMultisetTypes(new Set());
    }

    if (
      key === "min-bf" &&
      filterMap.has("min-bf") &&
      filterMinAndMaxValueInputsSecondary !== undefined
    ) {
      updatedFilterMap.delete("min-bf");
      setFilterMinBodyFatPercentage(null);
      filterMinAndMaxValueInputsSecondary.resetMinInput();
    }

    if (
      key === "max-bf" &&
      filterMap.has("max-bf") &&
      filterMinAndMaxValueInputsSecondary !== undefined
    ) {
      updatedFilterMap.delete("max-bf");
      setFilterMaxBodyFatPercentage(null);
      filterMinAndMaxValueInputsSecondary.resetMaxInput();
    }

    setFilterMap(updatedFilterMap);
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
    const prefixMap = new Map<ListFilterMapKey, string>();

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
    prefixMap.set("min-bf", `Min Body Fat %: `);
    prefixMap.set("max-bf", `Max Body Fat %: `);

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

  const filterRoutinesString = useMemo(() => {
    if (filterRoutines.size === 0 || routineMap === undefined)
      return "No Routines Selected";

    const routineNames: string[] = [];

    for (const routineId of filterRoutines) {
      if (routineMap.has(routineId)) {
        const routine = routineMap.get(routineId);
        routineNames.push(routine!.name);
      }
    }

    return routineNames.join(", ");
  }, [filterRoutines, routineMap]);

  const filterExercisesString = useMemo(() => {
    if (filterExercises.size === 0 || useExerciseList === undefined)
      return "No Exercises Selected";

    const exerciseNames: string[] = [];

    for (const exerciseId of filterExercises) {
      if (useExerciseList.exerciseMap.current.has(exerciseId)) {
        const exercise = useExerciseList.exerciseMap.current.get(exerciseId);
        exerciseNames.push(exercise!.name);
      }
    }

    return exerciseNames.join(", ");
  }, [filterExercises, useExerciseList]);

  const filterExerciseGroupsString = useMemo(() => {
    if (filterExerciseGroups.length === 0 || useExerciseList === undefined)
      return "No Exercise Groups Selected";

    const exerciseGroupNames: string[] = [];

    for (const group of filterExerciseGroups) {
      if (useExerciseList.exerciseGroupDictionary.has(group)) {
        const groupName = useExerciseList.exerciseGroupDictionary.get(group);
        exerciseGroupNames.push(groupName!);
      }
    }

    return exerciseGroupNames.join(", ");
  }, [filterExerciseGroups, useExerciseList]);

  const filterMeasurementsString = useMemo(() => {
    if (filterMeasurements.size === 0 || measurementMap === undefined)
      return "No Measurements Selected";

    const measurementNames: string[] = [];

    for (const measurementId of filterMeasurements) {
      if (measurementMap.has(measurementId.toString())) {
        const measurement = measurementMap.get(measurementId.toString());
        measurementNames.push(measurement!.name);
      }
    }

    return measurementNames.join(", ");
  }, [filterMeasurements, measurementMap]);

  const filterWorkoutTemplatesString = useMemo(() => {
    if (filterWorkoutTemplates.size === 0 || workoutTemplateMap === undefined)
      return "No Workout Templates Selected";

    const workoutTemplateNames: string[] = [];

    for (const workoutTemplateId of filterWorkoutTemplates) {
      if (workoutTemplateMap.has(workoutTemplateId)) {
        const workoutTemplate = workoutTemplateMap.get(workoutTemplateId);
        workoutTemplateNames.push(workoutTemplate!.name);
      }
    }

    return workoutTemplateNames.join(", ");
  }, [filterWorkoutTemplates, workoutTemplateMap]);

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
    filterRoutinesString,
    filterExercisesString,
    filterExerciseGroupsString,
    filterMeasurementsString,
    filterWorkoutTemplatesString,
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
  };
};

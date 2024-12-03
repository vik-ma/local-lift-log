import { useMemo, useState } from "react";
import {
  Exercise,
  ListFilterMapKey,
  Measurement,
  MeasurementMap,
  NumberRange,
  Routine,
  RoutineMap,
  UseDisclosureReturnType,
  UseExerciseListReturnType,
  UseListFiltersReturnType,
  WorkoutTemplate,
  WorkoutTemplateMap,
} from "../typings";
import { CalendarDate, RangeValue } from "@nextui-org/react";
import {
  useDefaultNumberRange,
  useWeekdayMap,
  useMeasurementTypes,
  useRoutineScheduleTypes,
} from ".";
import {
  CalculateNumDaysInCalendarDateRange,
  ConvertCalendarDateToLocalizedString,
  IsNumberRangeValidAndFiltered,
} from "../helpers";

export const useListFilters = (
  useExerciseList?: UseExerciseListReturnType,
  routineMap?: RoutineMap,
  measurementMap?: MeasurementMap,
  workoutTemplateMap?: WorkoutTemplateMap
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
  const [filterWorkoutTemplates, setFilterWorkoutTemplates] = useState<
    Set<number>
  >(new Set());

  const weekdayMap = useWeekdayMap();

  const [filterWeekdays, setFilterWeekdays] = useState<Set<string>>(
    new Set(weekdayMap.keys())
  );

  const defaultNumberRange = useDefaultNumberRange();

  const [filterWeightRange, setFilterWeightRange] =
    useState<NumberRange>(defaultNumberRange);

  const [filterWeightUnit, setFilterWeightUnit] = useState<string>("kg");

  const routineScheduleTypes = useRoutineScheduleTypes();

  const [filterScheduleTypes, setFilterScheduleTypes] = useState<Set<string>>(
    new Set(routineScheduleTypes)
  );

  const measurementTypes = useMeasurementTypes();

  const [filterMeasurementTypes, setFilterMeasurementTypes] =
    useState(measurementTypes);

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
      updatedFilterMap.set("routines", filterRoutinesString);
    }

    if (filterExercises.size > 0 && useExerciseList !== undefined) {
      updatedFilterMap.set("exercises", filterExercisesString);
    }

    if (filterExerciseGroups.length > 0 && useExerciseList !== undefined) {
      updatedFilterMap.set("exercise-groups", filterExerciseGroupsString);
    }

    if (IsNumberRangeValidAndFiltered(filterWeightRange)) {
      const filterWeightRangeString = `${filterWeightRange.start} ${filterWeightUnit} - ${filterWeightRange.end} ${filterWeightUnit}`;

      updatedFilterMap.set("weight", filterWeightRangeString);
    }

    if (filterMeasurements.size > 0) {
      updatedFilterMap.set("measurements", filterMeasurementsString);
    }

    if (filterWorkoutTemplates.size > 0 && workoutTemplateMap !== undefined) {
      updatedFilterMap.set("workout-templates", filterWorkoutTemplatesString);
    }

    if (filterScheduleTypes.size < 2) {
      const filterScheduleTypesString = Array.from(filterScheduleTypes)
        .map((item) => item)
        .join(", ");
      updatedFilterMap.set("schedule-type", filterScheduleTypesString);
    }

    setFilterMap(updatedFilterMap);

    activeModal.onClose();
  };

  const handleFilterMeasurementTypes = (key: string) => {
    const updatedFilterMap = new Map<ListFilterMapKey, string>();

    if (filterMeasurementTypes.includes(key)) {
      // Do nothing if trying to remove last item in filterMeasurementTypes
      if (filterMeasurementTypes.length === 1) return;

      const updatedMeasurementTypes = filterMeasurementTypes.filter(
        (item) => item !== key
      );

      setFilterMeasurementTypes(updatedMeasurementTypes);

      const filterMeasurementTypesString = updatedMeasurementTypes.join(", ");

      updatedFilterMap.set("measurement-types", filterMeasurementTypesString);
    } else {
      setFilterMeasurementTypes([...measurementTypes]);
    }

    setFilterMap(updatedFilterMap);
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
      setFilterMeasurements(new Set());
    }

    if (key === "measurement-types" && filterMap.has("measurement-types")) {
      updatedFilterMap.delete("measurement-types");
      setFilterMeasurementTypes([...measurementTypes]);
    }

    if (key === "workout-templates" && filterMap.has("workout-templates")) {
      updatedFilterMap.delete("workout-templates");
      setFilterWorkoutTemplates(new Set());
    }

    if (key === "schedule-type" && filterMap.has("schedule-type")) {
      updatedFilterMap.delete("schedule-type");
      setFilterScheduleTypes(new Set(routineScheduleTypes));
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
    setFilterMeasurementTypes([...measurementTypes]);
    setFilterWorkoutTemplates(new Set());
    setFilterScheduleTypes(new Set(routineScheduleTypes));
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
    if (filterMeasurementTypes.length < 2) return true;
    if (filterWorkoutTemplates.size > 0) return true;
    if (filterScheduleTypes.size < 2) return true;

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
    filterMeasurementTypes,
    filterWorkoutTemplates,
    filterScheduleTypes,
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
    prefixMap.set("measurement-types", `Measurement Type: `);
    prefixMap.set(
      "workout-templates",
      `Templates (${filterWorkoutTemplates.size}): `
    );
    prefixMap.set(
      "schedule-type",
      `Schedule Type (${filterScheduleTypes.size}): `
    );

    return prefixMap;
  }, [
    filterDateRange,
    filterWeekdays,
    filterRoutines,
    filterExercises,
    filterExerciseGroups,
    filterMeasurements,
    filterWorkoutTemplates,
    filterScheduleTypes,
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
      if (useExerciseList.exerciseMap.has(exerciseId)) {
        const exercise = useExerciseList.exerciseMap.get(exerciseId);
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
    routineScheduleTypes,
    filterScheduleTypes,
    setFilterScheduleTypes,
  };
};

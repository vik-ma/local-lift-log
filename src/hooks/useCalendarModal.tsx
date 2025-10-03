import { CalendarDate, useDisclosure } from "@heroui/react";
import {
  CalendarMonthItem,
  CalendarWorkoutTemplateMap,
  Routine,
  UseCalendarModalReturnType,
  UserSettings,
} from "../typings";
import {
  ConvertDateToYearMonthString,
  CreateExerciseGroupSetPrimary,
  FormatISODateStringToCalendarAriaLabelString,
  GetCalendarWorkoutList,
} from "../helpers";
import { useRef, useState } from "react";
import { getLocalTimeZone } from "@internationalized/date";
import { EXERCISE_GROUP_DICTIONARY } from "../constants";

const EMPTY_CALENDAR_MONTH_ITEM: CalendarMonthItem = {
  workoutList: [],
  workoutTemplateMap: new Map(),
  exerciseGroupSet: new Set(),
  routineWorkoutTemplateMap: new Map(),
};

type UseCalendarModalProps = {
  activeRoutine: Routine | undefined;
};

export const useCalendarModal = ({
  activeRoutine,
}: UseCalendarModalProps): UseCalendarModalReturnType => {
  const [operatingCalendarMonth, setOperatingCalendarMonth] =
    useState<CalendarMonthItem>(EMPTY_CALENDAR_MONTH_ITEM);
  const [calendarDateMarking, setCalendarDateMarking] =
    useState<string>("workouts");

  const calendarMonthMap = useRef<Map<string, CalendarMonthItem>>(new Map());

  const currentDateString = useRef<string>("");
  const currentMonth = useRef<string>("");

  const operatingYearMonth = useRef<string>("");

  const isCalendarWorkoutListLoaded = useRef<boolean>(false);

  const disableActiveRoutineOption = useRef<boolean>(false);

  const calendarModal = useDisclosure();

  const getWorkoutListForMonth = async (yearMonth: string) => {
    const workoutList = await GetCalendarWorkoutList(yearMonth);

    const workoutTemplateMap: CalendarWorkoutTemplateMap = new Map();

    const routineWorkoutTemplateMap: CalendarWorkoutTemplateMap = new Map();

    const exerciseGroupSet = new Set<string>();

    let nextIndex = 0;
    let nextIndexRoutine = 0;

    for (const workout of workoutList) {
      const id = workout.workout_template_id;

      // Increment index for every unique Workout Template ID
      if (!workoutTemplateMap.has(id)) {
        workoutTemplateMap.set(id, {
          index: nextIndex++,
          name: workout.workout_template_name,
        });
      }

      if (
        activeRoutine?.id === workout.routine_id &&
        !routineWorkoutTemplateMap.has(id)
      ) {
        routineWorkoutTemplateMap.set(id, {
          index: nextIndexRoutine++,
          name: workout.workout_template_name,
        });
      }

      workout.exerciseGroupSet = CreateExerciseGroupSetPrimary(
        workout.exercise_groups_string,
        EXERCISE_GROUP_DICTIONARY
      );

      workout.exerciseGroupSet.forEach((item) => exerciseGroupSet.add(item));
    }

    const calendarMonthItem: CalendarMonthItem = {
      workoutList,
      workoutTemplateMap,
      exerciseGroupSet,
      routineWorkoutTemplateMap,
    };

    setOperatingCalendarMonth(calendarMonthItem);

    calendarMonthMap.current.set(yearMonth, calendarMonthItem);

    operatingYearMonth.current = yearMonth;
  };

  const openCalendarModal = async (userSettings: UserSettings) => {
    if (!isCalendarWorkoutListLoaded.current) {
      const currentDate = new Date();

      const currentDateAriaLabelString =
        FormatISODateStringToCalendarAriaLabelString(
          currentDate.toISOString(),
          userSettings.locale
        );
      const currentYearMonth = ConvertDateToYearMonthString(currentDate);

      await getWorkoutListForMonth(currentYearMonth);

      currentDateString.current = currentDateAriaLabelString;
      currentMonth.current = currentYearMonth;
      operatingYearMonth.current = currentYearMonth;

      const disableActiveRoutine =
        activeRoutine === undefined ||
        activeRoutine.schedule_type === 2 ||
        (activeRoutine.schedule_type === 1 &&
          activeRoutine.custom_schedule_start_date === null);

      disableActiveRoutineOption.current = disableActiveRoutine;

      if (
        userSettings.calendar_date_marking === "active-routine" &&
        disableActiveRoutine
      ) {
        userSettings.calendar_date_marking = "workouts";
      }

      setCalendarDateMarking(userSettings.calendar_date_marking);

      isCalendarWorkoutListLoaded.current = true;
    } else {
      // Always set calendarWorkoutList to current month if already loaded,
      // since it will be automatically selected when opening modal
      const currentMonthItem = calendarMonthMap.current.get(
        currentMonth.current
      )!;

      setOperatingCalendarMonth(currentMonthItem);
      operatingYearMonth.current = currentMonth.current;
    }

    calendarModal.onOpen();
  };

  const handleCalendarMonthChange = async (date: CalendarDate) => {
    const yearMonth = ConvertDateToYearMonthString(
      date.toDate(getLocalTimeZone())
    );

    operatingYearMonth.current = yearMonth;

    if (yearMonth > currentMonth.current) {
      setOperatingCalendarMonth(EMPTY_CALENDAR_MONTH_ITEM);
      calendarMonthMap.current.set(yearMonth, EMPTY_CALENDAR_MONTH_ITEM);
      return;
    }

    if (calendarMonthMap.current.has(yearMonth)) {
      const calendarMonthItem = calendarMonthMap.current.get(yearMonth)!;
      setOperatingCalendarMonth(calendarMonthItem);
    } else {
      await getWorkoutListForMonth(yearMonth);
    }
  };

  return {
    calendarModal,
    openCalendarModal,
    operatingCalendarMonth,
    isCalendarWorkoutListLoaded,
    calendarMonthMap,
    handleCalendarMonthChange,
    currentDateString,
    calendarDateMarking,
    setCalendarDateMarking,
    operatingYearMonth,
    currentMonth,
    disableActiveRoutineOption,
  };
};

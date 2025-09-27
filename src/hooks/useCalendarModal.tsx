import { CalendarDate, useDisclosure } from "@heroui/react";
import {
  CalendarMonthItem,
  UseCalendarModalReturnType,
  UserSettings,
} from "../typings";
import {
  ConvertDateToYearMonthString,
  FormatISODateStringToCalendarAriaLabelString,
  GetCalendarWorkoutList,
} from "../helpers";
import { useRef, useState } from "react";
import { getLocalTimeZone } from "@internationalized/date";

export const useCalendarModal = (): UseCalendarModalReturnType => {
  const [operatingCalendarMonth, setOperatingCalendarMonth] =
    useState<CalendarMonthItem>({
      workoutList: [],
      workoutTemplateMap: new Map(),
    });
  const [calendarDateMarking, setCalendarDateMarking] =
    useState<string>("workouts");

  const calendarMonthMap = useRef<Map<string, CalendarMonthItem>>(new Map());

  const currentDateString = useRef<string>("");
  const currentMonth = useRef<string>("");

  const isCalendarWorkoutListLoaded = useRef<boolean>(false);

  const calendarModal = useDisclosure();

  const getWorkoutListForMonth = async (yearMonth: string) => {
    const workoutList = await GetCalendarWorkoutList(yearMonth);

    const workoutTemplateMap = new Map<number, string>(
      workoutList.map((calendarItem) => [
        calendarItem.workout_template_id,
        calendarItem.workout_template_name,
      ])
    );

    const calendarMonthItem: CalendarMonthItem = {
      workoutList,
      workoutTemplateMap,
    };

    setOperatingCalendarMonth(calendarMonthItem);

    calendarMonthMap.current.set(yearMonth, calendarMonthItem);
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

      setCalendarDateMarking(userSettings.calendar_date_marking);

      isCalendarWorkoutListLoaded.current = true;
    } else {
      // Always set calendarWorkoutList to current month if already loaded,
      // since it will be automatically selected when opening modal
      const currentMonthItem = calendarMonthMap.current.get(
        currentMonth.current
      )!;

      setOperatingCalendarMonth(currentMonthItem);
    }

    calendarModal.onOpen();
  };

  const handleCalendarMonthChange = async (date: CalendarDate) => {
    const yearMonth = ConvertDateToYearMonthString(
      date.toDate(getLocalTimeZone())
    );

    if (yearMonth > currentMonth.current) {
      const emptyCalendarMonthItem: CalendarMonthItem = {
        workoutList: [],
        workoutTemplateMap: new Map(),
      };

      setOperatingCalendarMonth(emptyCalendarMonthItem);
      calendarMonthMap.current.set(yearMonth, emptyCalendarMonthItem);
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
  };
};

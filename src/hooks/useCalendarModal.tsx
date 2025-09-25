import { CalendarDate, useDisclosure } from "@heroui/react";
import { CalendarMonthItem, UseCalendarModalReturnType } from "../typings";
import {
  ConvertDateToYearMonthString,
  FormatISODateStringToCalendarAriaLabelString,
  GetCalendarWorkoutList,
} from "../helpers";
import { useRef, useState } from "react";
import { getLocalTimeZone } from "@internationalized/date";

export const useCalendarModal = (): UseCalendarModalReturnType => {
  const [calendarMonthItem, setCalendarMonthItem] = useState<CalendarMonthItem>(
    { workoutList: [], workoutTemplateMap: new Map() }
  );

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

    const calendarMonthItemForMonth: CalendarMonthItem = {
      workoutList,
      workoutTemplateMap,
    };

    setCalendarMonthItem(calendarMonthItemForMonth);

    calendarMonthMap.current.set(yearMonth, calendarMonthItemForMonth);
  };

  const openCalendarModal = async (locale: string) => {
    if (!isCalendarWorkoutListLoaded.current) {
      const currentDate = new Date();

      const currentDateAriaLabelString =
        FormatISODateStringToCalendarAriaLabelString(
          currentDate.toISOString(),
          locale
        );
      const currentYearMonth = ConvertDateToYearMonthString(currentDate);

      await getWorkoutListForMonth(currentYearMonth);

      currentDateString.current = currentDateAriaLabelString;
      currentMonth.current = currentYearMonth;

      isCalendarWorkoutListLoaded.current = true;
    } else {
      // Always set calendarWorkoutList to current month if already loaded,
      // since it will be automatically selected when opening modal
      const currentMonthItem = calendarMonthMap.current.get(
        currentMonth.current
      )!;

      setCalendarMonthItem(currentMonthItem);
    }

    calendarModal.onOpen();
  };

  const handleCalendarMonthChange = async (date: CalendarDate) => {
    const yearMonth = ConvertDateToYearMonthString(
      date.toDate(getLocalTimeZone())
    );

    if (yearMonth > currentMonth.current) return;

    if (calendarMonthMap.current.has(yearMonth)) {
      const calendarMonthItemForMonth =
        calendarMonthMap.current.get(yearMonth)!;
      setCalendarMonthItem(calendarMonthItemForMonth);
    } else {
      await getWorkoutListForMonth(yearMonth);
    }
  };

  return {
    calendarModal,
    openCalendarModal,
    calendarMonthItem,
    isCalendarWorkoutListLoaded,
    calendarMonthMap,
    handleCalendarMonthChange,
    currentDateString,
  };
};

import { CalendarDate, useDisclosure } from "@heroui/react";
import {
  CalendarMonthItem,
  CalendarWorkoutItem,
  UseCalendarModalReturnType,
} from "../typings";
import {
  ConvertDateToYearMonthString,
  FormatISODateStringToCalendarAriaLabelString,
  GetCalendarWorkoutList,
} from "../helpers";
import { useRef, useState } from "react";
import { getLocalTimeZone } from "@internationalized/date";

export const useCalendarModal = (): UseCalendarModalReturnType => {
  const [calendarWorkoutList, setCalendarWorkoutList] = useState<
    CalendarWorkoutItem[]
  >([]);

  const calendarMonthMap = useRef<Map<string, CalendarMonthItem>>(new Map());

  const currentDateString = useRef<string>("");
  const currentMonth = useRef<string>("");

  const isCalendarWorkoutListLoaded = useRef<boolean>(false);

  const calendarModal = useDisclosure();

  const getWorkoutListForMonth = async (yearMonth: string) => {
    const workoutList = await GetCalendarWorkoutList(yearMonth);

    setCalendarWorkoutList(workoutList);

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

    calendarMonthMap.current.set(yearMonth, calendarMonthItem);
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
      const currentMonthWorkoutList = calendarMonthMap.current.get(
        currentMonth.current
      )!.workoutList;

      setCalendarWorkoutList(currentMonthWorkoutList);
    }

    calendarModal.onOpen();
  };

  const handleCalendarMonthChange = async (date: CalendarDate) => {
    const yearMonth = ConvertDateToYearMonthString(
      date.toDate(getLocalTimeZone())
    );

    if (yearMonth > currentMonth.current) return;

    if (calendarMonthMap.current.has(yearMonth)) {
      const workoutList = calendarMonthMap.current.get(yearMonth)!.workoutList;
      setCalendarWorkoutList(workoutList);
    } else {
      await getWorkoutListForMonth(yearMonth);
    }
  };

  return {
    calendarModal,
    openCalendarModal,
    calendarWorkoutList,
    isCalendarWorkoutListLoaded,
    calendarMonthMap,
    handleCalendarMonthChange,
    currentDateString,
  };
};

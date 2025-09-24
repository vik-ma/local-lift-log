import { CalendarDate, useDisclosure } from "@heroui/react";
import { CalendarWorkoutItem, UseCalendarModalReturnType } from "../typings";
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

  const monthWorkoutListMap = useRef<Map<string, CalendarWorkoutItem[]>>(
    new Map()
  );

  const currentDateString = useRef<string>("");
  const currentMonth = useRef<string>("");

  const isCalendarWorkoutListLoaded = useRef<boolean>(false);

  const calendarModal = useDisclosure();

  const getWorkoutListForMonth = async (yearMonth: string) => {
    const workoutList = await GetCalendarWorkoutList(yearMonth);

    setCalendarWorkoutList(workoutList);

    monthWorkoutListMap.current.set(yearMonth, workoutList);
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
      const currentMonthWorkoutList = monthWorkoutListMap.current.get(
        currentMonth.current
      )!;

      setCalendarWorkoutList(currentMonthWorkoutList);
    }

    calendarModal.onOpen();
  };

  const handleCalendarMonthChange = async (date: CalendarDate) => {
    const yearMonth = ConvertDateToYearMonthString(
      date.toDate(getLocalTimeZone())
    );

    if (yearMonth > currentMonth.current) return;

    if (monthWorkoutListMap.current.has(yearMonth)) {
      const workoutList = monthWorkoutListMap.current.get(yearMonth)!;
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
    monthWorkoutListMap,
    handleCalendarMonthChange,
    currentDateString,
  };
};

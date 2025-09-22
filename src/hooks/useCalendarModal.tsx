import { CalendarDate, useDisclosure } from "@heroui/react";
import { CalendarWorkoutItem, UseCalendarModalReturnType } from "../typings";
import {
  ConvertDateToYearMonthString,
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

  const currentMonth = useRef<string>("");
  const selectedMonth = useRef<string>("");

  const isCalendarWorkoutListLoaded = useRef<boolean>(false);

  const calendarModal = useDisclosure();

  const getWorkoutListForMonth = async (yearMonth: string) => {
    const workoutList = await GetCalendarWorkoutList(yearMonth);

    setCalendarWorkoutList(workoutList);

    selectedMonth.current = yearMonth;
    monthWorkoutListMap.current.set(yearMonth, workoutList);
  };

  const openCalendarModal = async () => {
    const currentYearMonth = ConvertDateToYearMonthString(new Date());

    await getWorkoutListForMonth(currentYearMonth);

    currentMonth.current = currentYearMonth;

    isCalendarWorkoutListLoaded.current = true;

    calendarModal.onOpen();
  };

  const handleCalendarMonthChange = async (date: CalendarDate) => {
    const yearMonth = ConvertDateToYearMonthString(
      date.toDate(getLocalTimeZone())
    );

    selectedMonth.current = yearMonth;

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
    selectedMonth,
    monthWorkoutListMap,
    handleCalendarMonthChange,
  };
};

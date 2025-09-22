import { useDisclosure } from "@heroui/react";
import { CalendarWorkoutItem, UseCalendarModalReturnType } from "../typings";
import {
  ConvertDateToYearMonthString,
  GetCalendarWorkoutList,
} from "../helpers";
import { useRef, useState } from "react";

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

  return {
    calendarModal,
    openCalendarModal,
    calendarWorkoutList,
    isCalendarWorkoutListLoaded,
    selectedMonth,
    monthWorkoutListMap,
  };
};

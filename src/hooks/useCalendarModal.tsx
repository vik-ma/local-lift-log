import { useDisclosure } from "@heroui/react";
import { CalendarWorkoutItem, UseCalendarModalReturnType } from "../typings";
import { GetCalendarWorkoutList, GetCurrentYmdDateString } from "../helpers";
import { useState } from "react";

export const useCalendarModal = (): UseCalendarModalReturnType => {
  const [calendarWorkoutList, setCalendarWorkoutList] = useState<
    CalendarWorkoutItem[]
  >([]);

  const calendarModal = useDisclosure();

  const openCalendarModal = async () => {
    const currentYearMonth = GetCurrentYmdDateString().substring(0, 7);

    const workoutList = await GetCalendarWorkoutList(currentYearMonth);

    setCalendarWorkoutList(workoutList);

    calendarModal.onOpen();
  };

  return { calendarModal, openCalendarModal, calendarWorkoutList };
};

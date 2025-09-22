import { useDisclosure } from "@heroui/react";
import { UseCalendarModalReturnType } from "../typings";

export const useCalendarModal = (): UseCalendarModalReturnType => {
  const calendarModal = useDisclosure();

  return { calendarModal };
};

import { useDisclosure } from "@heroui/react";
import { UseCalendarModalReturnType } from "../typings";

export const useCalendarModal = (): UseCalendarModalReturnType => {
  const calendarModal = useDisclosure();

  const openCalendarModal = () => {
    calendarModal.onOpen();
  };

  return { calendarModal, openCalendarModal };
};

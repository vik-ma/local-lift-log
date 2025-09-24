import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Calendar,
} from "@heroui/react";
import { UseCalendarModalReturnType, UserSettings } from "../../typings";
import { MODAL_BODY_HEIGHT } from "../../constants";
import { useEffect } from "react";
import { I18nProvider } from "@react-aria/i18n";
import { FormatISODateStringToCalendarAriaLabelString } from "../../helpers";

type CalendarModalProps = {
  useCalendarModal: UseCalendarModalReturnType;
  userSettings: UserSettings;
};

export const CalendarModal = ({
  useCalendarModal,
  userSettings,
}: CalendarModalProps) => {
  const {
    calendarModal,
    calendarWorkoutList,
    isCalendarWorkoutListLoaded,
    handleCalendarMonthChange,
  } = useCalendarModal;

  const renderWorkoutListOverlay = () => {
    const dateWrapperCellMap = new Map<string, HTMLDivElement>();

    for (const workout of calendarWorkoutList) {
      const date = FormatISODateStringToCalendarAriaLabelString(
        workout.date,
        userSettings.locale
      );

      const querySelectorString = `[aria-label="${date}"]`;

      const dateCell = document.querySelector(
        querySelectorString
      ) as HTMLElement;

      if (dateCell === null) continue;

      const parentCell = dateCell.parentElement;

      if (parentCell === null) continue;

      let wrapper = document.createElement("div");

      if (dateWrapperCellMap.has(date)) {
        wrapper = dateWrapperCellMap.get(date)!;
      } else {
        wrapper.style.position = "absolute";
        wrapper.style.display = "flex";
        wrapper.style.gap = "1px";
        wrapper.style.bottom = "3px";
        wrapper.style.left = "50%";
        wrapper.style.transform = "translateX(-50%)";
        wrapper.style.pointerEvents = "none";

        parentCell.style.position = "relative";

        parentCell.appendChild(wrapper);

        dateWrapperCellMap.set(date, wrapper);
      }

      const dot = document.createElement("div");

      dot.style.width = "6px";
      dot.style.height = "6px";
      dot.style.borderRadius = "50%";
      dot.style.backgroundColor = "rgba(0,0,0,0.2)";

      wrapper.appendChild(dot);
    }
  };

  useEffect(() => {
    if (!calendarModal.isOpen || !isCalendarWorkoutListLoaded.current) return;

    renderWorkoutListOverlay();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarModal.isOpen, calendarWorkoutList]);

  return (
    <Modal
      isOpen={calendarModal.isOpen}
      onOpenChange={calendarModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Calendar</ModalHeader>
            <ModalBody className="py-0">
              <div
                className={`${MODAL_BODY_HEIGHT} flex flex-col items-center gap-1.5`}
              >
                <I18nProvider locale={userSettings.locale}>
                  <Calendar
                    calendarWidth={280}
                    showMonthAndYearPickers
                    onFocusChange={(value) => handleCalendarMonthChange(value)}
                  />
                </I18nProvider>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

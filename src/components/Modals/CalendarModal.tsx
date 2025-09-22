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
    for (const workout of calendarWorkoutList) {
      const date = FormatISODateStringToCalendarAriaLabelString(
        workout.date,
        userSettings.locale
      );

      const querySelectorString = `[aria-label="${date}"]`;

      const dateCell = document.querySelector(
        querySelectorString
      ) as HTMLElement;

      const parentCell = dateCell.parentElement;

      if (parentCell) {
        const overlay = document.createElement("div");

        overlay.style.position = "absolute";
        overlay.style.bottom = "2px";
        overlay.style.left = "50%";
        overlay.style.width = "6px";
        overlay.style.height = "6px";
        overlay.style.transform = "translateX(-50%)";
        overlay.style.backgroundColor = "rgba(0,0,0,0.2)";
        overlay.style.pointerEvents = "none";

        parentCell.style.position = "relative";

        parentCell.appendChild(overlay);
      }
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

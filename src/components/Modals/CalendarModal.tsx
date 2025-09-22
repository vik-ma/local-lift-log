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
  const { calendarModal, isCalendarWorkoutListLoaded } = useCalendarModal;

  useEffect(() => {
    if (!calendarModal.isOpen || !isCalendarWorkoutListLoaded.current) return;

    const date = FormatISODateStringToCalendarAriaLabelString(
      "2025-09-08T14:30:00Z",
      userSettings.locale
    );

    const querySelectorString = `[aria-label="${date}"]`;

    const el = document.querySelector(querySelectorString) as HTMLElement;

    if (el) {
      const overlay = document.createElement("div");

      overlay.style.position = "absolute";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0,0,0,0.2)";
      overlay.style.pointerEvents = "none";

      el.style.position = "relative";

      el.appendChild(overlay);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarModal.isOpen]);

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
                  <Calendar calendarWidth={280} showMonthAndYearPickers />
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

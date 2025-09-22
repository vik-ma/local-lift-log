import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Calendar,
} from "@heroui/react";
import { UseDisclosureReturnType, UserSettings } from "../../typings";
import { MODAL_BODY_HEIGHT } from "../../constants";

type CalendarModalProps = {
  calendarModal: UseDisclosureReturnType;
  userSettings: UserSettings;
};

export const CalendarModal = ({
  calendarModal,
  userSettings,
}: CalendarModalProps) => {
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
                <Calendar calendarWidth={300} showMonthAndYearPickers />
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

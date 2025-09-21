import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { UseDisclosureReturnType, UserSettings } from "../../typings";

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
            <ModalBody className="py-0"></ModalBody>
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

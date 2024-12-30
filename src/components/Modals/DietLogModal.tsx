import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { DietLog, UseDisclosureReturnType, UserSettings } from "../../typings";

type DietLogModalProps = {
  dietLogModal: UseDisclosureReturnType;
  dietLog: DietLog;
  setDietLog: React.Dispatch<React.SetStateAction<DietLog>>;
  userSettings: UserSettings;
  buttonAction: () => void;
};

export const DietLogModal = ({
  dietLogModal,
  dietLog,
  setDietLog,
  userSettings,
  buttonAction,
}: DietLogModalProps) => {
  return (
    <Modal
      isOpen={dietLogModal.isOpen}
      onOpenChange={dietLogModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {dietLog.id === 0 ? "New" : "Edit"} Diet Log
            </ModalHeader>
            <ModalBody>Test</ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={buttonAction}>
                {dietLog.id !== 0 ? "Save" : "Update"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

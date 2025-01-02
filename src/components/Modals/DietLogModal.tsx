import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { DietLog, UseDisclosureReturnType, UserSettings } from "../../typings";
import { DietLogDayDropdown } from "../Dropdowns/DietLogDayDropdown";

type DietLogModalProps = {
  dietLogModal: UseDisclosureReturnType;
  dietLog: DietLog;
  setDietLog: React.Dispatch<React.SetStateAction<DietLog>>;
  targetDay: string;
  setTargetDay: React.Dispatch<React.SetStateAction<string>>;
  userSettings: UserSettings;
  buttonAction: () => void;
};

export const DietLogModal = ({
  dietLogModal,
  dietLog,
  setDietLog,
  targetDay,
  setTargetDay,
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
              {dietLog.id === 0 ? "New" : "Edit"} Diet Log Entry
            </ModalHeader>
            <ModalBody>
              <DietLogDayDropdown value={targetDay} setValue={setTargetDay} />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={buttonAction}>
                {dietLog.id === 0 ? "Save" : "Update"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import {
  DietLog,
  UseDietLogEntryInputsReturnType,
  UseDisclosureReturnType,
} from "../../typings";
import { DietLogDayDropdown } from "../Dropdowns/DietLogDayDropdown";

type DietLogModalProps = {
  dietLogModal: UseDisclosureReturnType;
  dietLog: DietLog;
  useDietLogEntryInputs: UseDietLogEntryInputsReturnType;
  buttonAction: () => void;
};

export const DietLogModal = ({
  dietLogModal,
  dietLog,
  useDietLogEntryInputs,
  buttonAction,
}: DietLogModalProps) => {
  const { targetDay, setTargetDay } = useDietLogEntryInputs;

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
              <DietLogDayDropdown
                value={targetDay}
                setState={setTargetDay}
                targetType="state"
              />
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

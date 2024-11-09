import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import {
  Routine,
  UseDisclosureReturnType,
  UseRoutineListReturnType,
} from "../../typings";

type RoutineListModal = {
  routineListModal: UseDisclosureReturnType;
  routineList: UseRoutineListReturnType;
  onClickAction: (routine: Routine) => void;
};

export const RoutineListModal = ({
  routineListModal,
  routineList,
  onClickAction,
}: RoutineListModal) => {
  return (
    <Modal
      isOpen={routineListModal.isOpen}
      onOpenChange={routineListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Select Workout</ModalHeader>
            <ModalBody>
              <div className="h-[440px] flex flex-col gap-1.5"></div>
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

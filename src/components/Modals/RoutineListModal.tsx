import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { Routine, UseRoutineListReturnType } from "../../typings";

type RoutineListModal = {
  routineList: UseRoutineListReturnType;
  onClickAction: (routine: Routine) => void;
};

export const RoutineListModal = ({
  routineList,
  onClickAction,
}: RoutineListModal) => {
  const { routineListModal } = routineList;

  return (
    <Modal
      isOpen={routineListModal.isOpen}
      onOpenChange={routineListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Select Routine</ModalHeader>
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

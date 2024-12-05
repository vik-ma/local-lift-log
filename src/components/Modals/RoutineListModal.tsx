import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { Routine, UseRoutineListReturnType } from "../../typings";
import { RoutineModalList } from "..";

type RoutineListModal = {
  useRoutineList: UseRoutineListReturnType;
  activeRoutineId: number;
  onClickAction: (routine: Routine) => void;
};

export const RoutineListModal = ({
  useRoutineList,
  activeRoutineId,
  onClickAction,
}: RoutineListModal) => {
  const { routineListModal } = useRoutineList;

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
              <RoutineModalList
                useRoutineList={useRoutineList}
                onClickAction={onClickAction}
                activeRoutineId={activeRoutineId}
              />
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

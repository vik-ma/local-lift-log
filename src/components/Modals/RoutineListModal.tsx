import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Routine, UseRoutineListReturnType, UserSettings } from "../../typings";
import { RoutineModalList } from "..";

type RoutineListModal = {
  useRoutineList: UseRoutineListReturnType;
  activeRoutineId: number;
  userSettings: UserSettings;
  onClickAction: (routine: Routine) => void;
};

export const RoutineListModal = ({
  useRoutineList,
  activeRoutineId,
  userSettings,
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
            <ModalBody className="py-0">
              <RoutineModalList
                useRoutineList={useRoutineList}
                onClickAction={onClickAction}
                activeRoutineId={activeRoutineId}
                userSettings={userSettings}
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

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ScrollShadow,
  Button,
} from "@nextui-org/react";
import { GroupedWorkoutSet, UseDisclosureReturnType } from "../../typings";

type GroupedWorkoutSetListModal = {
  groupedWorkoutSetListModal: UseDisclosureReturnType;
  groupedWorkoutSetList: GroupedWorkoutSet[];
  onClickAction: (groupedWorkoutSet: GroupedWorkoutSet) => void;
};

export const GroupedWorkoutSetListModal = ({
  groupedWorkoutSetListModal,
  groupedWorkoutSetList,
  onClickAction,
}: GroupedWorkoutSetListModal) => {
  return (
    <Modal
      isOpen={groupedWorkoutSetListModal.isOpen}
      onOpenChange={groupedWorkoutSetListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Select Workout</ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[400px] flex flex-col gap-1"></ScrollShadow>
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

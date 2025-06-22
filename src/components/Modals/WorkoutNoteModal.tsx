import {
  GroupedWorkoutSet,
  UseDisclosureReturnType,
  WorkoutSet,
} from "../../typings";
import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ScrollShadow,
} from "@heroui/react";

type WorkoutNoteModalProps = {
  workoutNoteModal: UseDisclosureReturnType;
  set: WorkoutSet;
  groupedWorkoutSet: GroupedWorkoutSet;
  isTemplate: boolean;
  handleSaveButton: () => void;
};
export const WorkoutNoteModal = ({
  workoutNoteModal,
  set,
  groupedWorkoutSet,
  isTemplate,
  handleSaveButton,
}: WorkoutNoteModalProps) => {
  return (
    <Modal
      isOpen={workoutNoteModal.isOpen}
      onOpenChange={workoutNoteModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>TODO: FIX HEADER</ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[400px]"></ScrollShadow>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleSaveButton}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

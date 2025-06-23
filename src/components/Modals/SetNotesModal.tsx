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

type SetNotesModalProps = {
  setNotesModal: UseDisclosureReturnType;
  operatingSet: WorkoutSet;
  operatingGroupedWorkoutSet: GroupedWorkoutSet | undefined;
  isTemplate: boolean;
  handleSaveButton: () => void;
};
export const SetNotesModal = ({
  setNotesModal,
  operatingSet,
  operatingGroupedWorkoutSet,
  isTemplate,
  handleSaveButton,
}: SetNotesModalProps) => {
  return (
    <Modal
      isOpen={setNotesModal.isOpen}
      onOpenChange={setNotesModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{operatingSet.exercise_name} Set Notes</ModalHeader>
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

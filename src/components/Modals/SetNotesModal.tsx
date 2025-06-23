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
              <ScrollShadow className="flex flex-col h-[400px]">
                <div className="flex flex-col gap-px">
                  <h3 className="text-lg font-semibold">Set Note</h3>
                  {operatingSet.note === null ? (
                    <span className="text-stone-400 italic text-sm">
                      No Set Note
                    </span>
                  ) : (
                    <span className="text-stone-500 text-sm">
                      {operatingSet.note}
                    </span>
                  )}
                </div>
              </ScrollShadow>
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

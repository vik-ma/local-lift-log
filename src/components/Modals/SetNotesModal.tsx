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
  const setIndex = 0;

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
              <ScrollShadow className="flex flex-col gap-1.5 h-[400px]">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">Exercise Note</h3>
                  {operatingGroupedWorkoutSet?.exerciseList[setIndex].note ===
                  null ? (
                    <span className="text-stone-400 italic text-sm">
                      No Exercise Note
                    </span>
                  ) : (
                    <span className="text-stone-500 text-sm">
                      {operatingGroupedWorkoutSet?.exerciseList[setIndex].note}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
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

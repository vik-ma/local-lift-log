import { useEffect, useState } from "react";
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
  Input,
} from "@heroui/react";
import { ConvertNullToEmptyInputString } from "../../helpers";

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
  const [commentInput, setCommentInput] = useState<string>("");

  const setIndex = operatingGroupedWorkoutSet?.isMultiset
    ? operatingSet.set_index
    : 0;

  useEffect(() => {
    setCommentInput(ConvertNullToEmptyInputString(operatingSet.comment));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingSet.id]);

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
                  {operatingGroupedWorkoutSet?.exerciseList[setIndex!].note ===
                  null ? (
                    <span className="text-stone-400 italic text-sm">
                      No Exercise Note
                    </span>
                  ) : (
                    <span className="text-stone-500 text-sm break-words">
                      {operatingGroupedWorkoutSet?.exerciseList[setIndex!].note}
                    </span>
                  )}
                </div>
                {operatingGroupedWorkoutSet?.isMultiset && (
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">Multiset Note</h3>
                    {operatingGroupedWorkoutSet.multiset!.note === null ? (
                      <span className="text-stone-400 italic text-sm">
                        No Multiset Note
                      </span>
                    ) : (
                      <span className="text-stone-500 text-sm break-words">
                        {operatingGroupedWorkoutSet.multiset!.note}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">Set Note</h3>
                  {operatingSet.note === null ? (
                    <span className="text-stone-400 italic text-sm">
                      No Set Note
                    </span>
                  ) : (
                    <span className="text-stone-500 text-sm break-words">
                      {operatingSet.note}
                    </span>
                  )}
                </div>
                {!isTemplate && (
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-lg font-semibold">Set Comment</h3>
                    <Input
                      aria-label="Set Comment Input"
                      value={commentInput}
                      variant="faded"
                      radius="sm"
                      onValueChange={setCommentInput}
                      isClearable
                    />
                  </div>
                )}
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

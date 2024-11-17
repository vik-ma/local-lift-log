import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { ExerciseGroupCheckboxes } from "..";
import {
  ExerciseGroupMap,
  UseDisclosureReturnType,
  UseExerciseListReturnType,
} from "../../typings";

type ExerciseGroupModalProps = {
  exerciseGroupModal: UseDisclosureReturnType;
  useExerciseList: UseExerciseListReturnType;
  exerciseGroupDictionary: ExerciseGroupMap;
};

export const FilterExerciseGroupsModal = ({
  exerciseGroupModal,
  useExerciseList,
  exerciseGroupDictionary,
}: ExerciseGroupModalProps) => {
  const handleToggleAllButton = () => {
    if (areExerciseGroupsFiltered) {
      setShownExerciseGroups([...exerciseGroupList]);
    } else {
      setShownExerciseGroups([]);
    }
  };

  const {
    shownExerciseGroups,
    showSecondaryExerciseGroups,
    setShowSecondaryExerciseGroups,
    exerciseGroupList,
    setShownExerciseGroups,
    areExerciseGroupsFiltered,
  } = useExerciseList;

  return (
    <Modal
      isOpen={exerciseGroupModal.isOpen}
      onOpenChange={exerciseGroupModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter Exercise Groups</ModalHeader>
            <ModalBody>
              <ExerciseGroupCheckboxes
                isValid={true}
                value={shownExerciseGroups}
                handleChange={setShownExerciseGroups}
                exerciseGroupDictionary={exerciseGroupDictionary}
                useValueAsValue
                includeSecondaryGroups={showSecondaryExerciseGroups}
                setIncludeSecondaryGroups={setShowSecondaryExerciseGroups}
              />
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="flat"
                  color="secondary"
                  onPress={handleToggleAllButton}
                >
                  Toggle All
                </Button>
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

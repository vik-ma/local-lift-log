import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { ExerciseGroupCheckboxes } from "..";
import {
  UseExerciseListReturnType,
  UseFilterExerciseListReturnType,
} from "../../typings";

type ExerciseGroupModalProps = {
  useExerciseList: UseExerciseListReturnType;
  useFilterExerciseList: UseFilterExerciseListReturnType;
};

export const FilterExerciseGroupsModal = ({
  useExerciseList,
  useFilterExerciseList,
}: ExerciseGroupModalProps) => {
  const {
    includeSecondaryGroups,
    setIncludeSecondaryGroups,
    exerciseGroupList,
    exerciseGroupDictionary,
  } = useExerciseList;

  const {
    filterExerciseGroups,
    setFilterExerciseGroups,
    exerciseGroupModal,
    handleFilterSaveButton,
  } = useFilterExerciseList;

  const handleToggleAllButton = () => {
    if (filterExerciseGroups.length === 0) {
      setFilterExerciseGroups([...exerciseGroupList]);
    } else {
      setFilterExerciseGroups([]);
    }
  };

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
                value={filterExerciseGroups}
                handleChange={setFilterExerciseGroups}
                exerciseGroupDictionary={exerciseGroupDictionary}
                useValueAsValue
                includeSecondaryGroups={includeSecondaryGroups}
                setIncludeSecondaryGroups={setIncludeSecondaryGroups}
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
                <Button
                  color="primary"
                  onPress={() => handleFilterSaveButton(exerciseGroupModal)}
                >
                  Filter
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

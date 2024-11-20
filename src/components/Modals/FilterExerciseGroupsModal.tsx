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
  const handleToggleAllButton = () => {
    if (areExerciseGroupsFiltered) {
      setShownExerciseGroups([...exerciseGroupList]);
    } else {
      setShownExerciseGroups([]);
    }
  };

  const {
    includeSecondaryGroups,
    setIncludeSecondaryGroups,
    exerciseGroupList,
    exerciseGroupDictionary,
  } = useExerciseList;

  const {
    shownExerciseGroups,
    setShownExerciseGroups,
    areExerciseGroupsFiltered,
    exerciseGroupModal,
  } = useFilterExerciseList;

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
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

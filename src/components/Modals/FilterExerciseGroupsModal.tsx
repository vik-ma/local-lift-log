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
  UseExerciseListFiltersReturnType,
  ExerciseFilterValues,
} from "../../typings";
import { useState } from "react";

type ExerciseGroupModalProps = {
  useExerciseList: UseExerciseListReturnType;
  useExerciseListFilters: UseExerciseListFiltersReturnType;
};

export const FilterExerciseGroupsModal = ({
  useExerciseList,
  useExerciseListFilters,
}: ExerciseGroupModalProps) => {
  const [filterExerciseGroups, setFilterExerciseGroups] = useState<string[]>(
    []
  );
  const [includeSecondaryGroups, setIncludeSecondaryGroups] =
    useState<boolean>(false);

  const { exerciseGroupList, exerciseGroupDictionary } = useExerciseList;

  const { filterExerciseGroupModal, handleFilterSaveButton } =
    useExerciseListFilters;

  const handleToggleAllButton = () => {
    if (filterExerciseGroups.length === 0) {
      setFilterExerciseGroups([...exerciseGroupList]);
    } else {
      setFilterExerciseGroups([]);
    }
  };

  const handleSaveButton = () => {
    const filterValues: ExerciseFilterValues = {
      filterExerciseGroups: filterExerciseGroups,
      includeSecondaryGroups: includeSecondaryGroups,
    };

    handleFilterSaveButton(filterValues, filterExerciseGroupModal);
  };

  return (
    <Modal
      isOpen={filterExerciseGroupModal.isOpen}
      onOpenChange={filterExerciseGroupModal.onOpenChange}
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
                <Button color="primary" onPress={handleSaveButton}>
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

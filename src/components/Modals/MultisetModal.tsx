import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import {
  Multiset,
  Exercise,
  UseExerciseListReturnType,
  WorkoutSet,
  UserSettings,
} from "../../typings";
import { MultisetDropdown } from "../Dropdowns/MultisetDropdown";
import { ExerciseModalList, MultisetSetList, SetValueConfig } from "../";
import {
  useSetTrackingInputs,
  useDefaultSetInputValues,
  useMultisetActions,
} from "../../hooks";

type MultisetModalProps = {
  multisetModal: ReturnType<typeof useDisclosure>;
  multiset: Multiset;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  operatingSet: WorkoutSet;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  operationType: string;
  handleClickExercise: (exercise: Exercise) => void;
  useMultisetActions: ReturnType<typeof useMultisetActions>;
  exerciseList: UseExerciseListReturnType;
  userSettings: UserSettings;
  saveButtonAction: () => void;
  updateOperatingSet: () => void;
};

export const MultisetModal = ({
  multisetModal,
  multiset,
  setMultiset,
  operatingSet,
  setOperatingSet,
  operationType,
  handleClickExercise,
  useMultisetActions,
  exerciseList,
  userSettings,
  saveButtonAction,
  updateOperatingSet,
}: MultisetModalProps) => {
  const defaultSetInputValues = useDefaultSetInputValues();

  const operatingSetInputs = useSetTrackingInputs();

  const clearSetInputValues = () => {
    operatingSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
    setOperatingSet({
      ...operatingSet,
      time_in_seconds: 0,
    });
  };

  const {
    isSelectingExercise,
    setIsSelectingExercise,
    isEditingSet,
    setIsEditingSet,
    selectedMultisetExercise,
    handleMultisetSetOptionSelection,
  } = useMultisetActions;

  const handleLeftButton = () => {
    if (isSelectingExercise) setIsSelectingExercise(false);

    if (isEditingSet) setIsEditingSet(false);

    if (!isEditingSet && !isSelectingExercise) setIsSelectingExercise(true);
  };

  return (
    <Modal
      isOpen={multisetModal.isOpen}
      onOpenChange={multisetModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {isSelectingExercise
                ? "Select Exercise"
                : isEditingSet
                ? "Edit Set"
                : operationType === "add"
                ? "Create Multiset"
                : "Edit Multiset"}
            </ModalHeader>
            <ModalBody>
              {isSelectingExercise ? (
                <ExerciseModalList
                  handleClickExercise={handleClickExercise}
                  exerciseList={exerciseList}
                />
              ) : isEditingSet ? (
                <SetValueConfig
                  selectedExercise={selectedMultisetExercise}
                  operatingSet={operatingSet}
                  setOperatingSet={setOperatingSet}
                  operationType={"edit"}
                  useSetTrackingInputs={operatingSetInputs}
                  userSettings={userSettings}
                  clearSetInputValues={clearSetInputValues}
                  isMultiset={true}
                />
              ) : (
                <div className="flex flex-col items-center gap-2.5 h-[400px] overflow-auto scroll-gradient">
                  <MultisetDropdown
                    multiset_type={multiset.multiset_type}
                    setMultiset={setMultiset}
                  />
                  <MultisetSetList
                    multiset={multiset}
                    setMultiset={setMultiset}
                    handleMultisetSetOptionSelection={
                      handleMultisetSetOptionSelection
                    }
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                <Button
                  className="w-[7.5rem]"
                  variant="flat"
                  onPress={() => handleLeftButton()}
                >
                  {isSelectingExercise
                    ? "Cancel"
                    : isEditingSet
                    ? "Back"
                    : "Add Exercise"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  className="w-[6.5rem]"
                  color="success"
                  isDisabled={
                    (!isEditingSet && multiset.setList.length === 0) ||
                    (isEditingSet && operatingSet.id < 1)
                  }
                  onPress={isEditingSet ? updateOperatingSet : saveButtonAction}
                >
                  {isEditingSet
                    ? "Update Set"
                    : operationType === "edit"
                    ? "Save"
                    : "Create"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MultisetModal;

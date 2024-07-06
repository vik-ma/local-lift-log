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
import { useState } from "react";
import { useSetTrackingInputs, useDefaultSetInputValues } from "../../hooks";

type MultisetModalProps = {
  multisetModal: ReturnType<typeof useDisclosure>;
  multiset: Multiset;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  operatingSet: WorkoutSet;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  operationType: string;
  handleClickExercise: (exercise: Exercise) => void;
  selectedExercise: Exercise | undefined;
  setSelectedExercise: React.Dispatch<
    React.SetStateAction<Exercise | undefined>
  >;
  exerciseList: UseExerciseListReturnType;
  userSettings: UserSettings;
  saveButtonAction: () => void;
};

export const MultisetModal = ({
  multisetModal,
  multiset,
  setMultiset,
  operatingSet,
  setOperatingSet,
  operationType,
  handleClickExercise,
  selectedExercise,
  setSelectedExercise,
  exerciseList,
  userSettings,
  saveButtonAction,
}: MultisetModalProps) => {
  const [isEditingSet, setIsEditingSet] = useState<boolean>(false);

  const defaultSetInputValues = useDefaultSetInputValues();

  const operatingSetInputs = useSetTrackingInputs();

  const clearSetInputValues = () => {
    operatingSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
    setOperatingSet({
      ...operatingSet,
      time_in_seconds: 0,
    });
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
              {selectedExercise === undefined
                ? "Select Exercise"
                : isEditingSet
                ? "Edit Set"
                : operationType === "add"
                ? "Create Multiset"
                : "Edit Multiset"}
            </ModalHeader>
            <ModalBody>
              {selectedExercise === undefined ? (
                <ExerciseModalList
                  handleClickExercise={handleClickExercise}
                  exerciseList={exerciseList}
                />
              ) : isEditingSet ? (
                <SetValueConfig
                  selectedExercise={selectedExercise}
                  operatingSet={operatingSet}
                  setOperatingSet={setOperatingSet}
                  operationType={"edit"}
                  useSetTrackingInputs={operatingSetInputs}
                  userSettings={userSettings}
                  clearSetInputValues={clearSetInputValues}
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
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                <Button
                  variant="flat"
                  // TODO: FIX
                  onPress={() => setSelectedExercise(undefined)}
                >
                  {selectedExercise === undefined ? "Cancel" : "Add Exercise"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  isDisabled={multiset.setList.length === 0}
                  onPress={saveButtonAction}
                >
                  {operationType === "edit" ? "Save" : "Create"}
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

import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";
import { ExerciseModalList, NumSetsDropdown, SetValueConfig } from "../";
import {
  Exercise,
  UserSettings,
  WorkoutSet,
  UseSetTrackingInputsReturnType,
  UseExerciseListReturnType,
  UseDisclosureReturnType,
  UseFilterExerciseListReturnType,
} from "../../typings";
import { useMemo, useState } from "react";

type SetModalProps = {
  setModal: UseDisclosureReturnType;
  selectedExercise: Exercise | undefined;
  setSelectedExercise: React.Dispatch<
    React.SetStateAction<Exercise | undefined>
  >;
  handleClickExercise: (exercise: Exercise) => void;
  operationType: string;
  operatingSet: WorkoutSet;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  useSetTrackingInputs: UseSetTrackingInputsReturnType;
  isSetTrackingValuesInvalid: boolean;
  handleSaveSetButton: (numSets: string, targetSet?: string) => void;
  resetSetInputValues: (isOperatingSet: boolean) => void;
  userSettings: UserSettings;
  exerciseList: UseExerciseListReturnType;
  numMultisetSets: number;
  openCalculationModal: (
    isWeight: boolean,
    exercise: Exercise,
    isActiveSet: boolean,
    setInputs: UseSetTrackingInputsReturnType,
    set: WorkoutSet
  ) => Promise<void>;
  useFilterExerciseList: UseFilterExerciseListReturnType;
};

export const SetModal = ({
  setModal,
  selectedExercise,
  setSelectedExercise,
  handleClickExercise,
  operationType,
  operatingSet,
  setOperatingSet,
  useSetTrackingInputs,
  isSetTrackingValuesInvalid,
  handleSaveSetButton,
  resetSetInputValues,
  userSettings,
  exerciseList,
  numMultisetSets,
  openCalculationModal,
  useFilterExerciseList,
}: SetModalProps) => {
  const [numNewSets, setNumNewSets] = useState<string>(
    userSettings.default_num_new_sets
  );
  const [multisetSetTarget, setMultisetSetTarget] = useState<string>("1");

  const isAddingExercise = useMemo(() => {
    return operationType === "add" && selectedExercise !== undefined;
  }, [operationType, selectedExercise]);

  return (
    <Modal isOpen={setModal.isOpen} onOpenChange={setModal.onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {selectedExercise === undefined
                ? "Select Exercise"
                : "Tracking Options"}
            </ModalHeader>
            <ModalBody>
              {selectedExercise === undefined ? (
                <ExerciseModalList
                  handleClickExercise={handleClickExercise}
                  exerciseList={exerciseList}
                  useFilterExerciseList={useFilterExerciseList}
                  userSettingsId={userSettings.id}
                />
              ) : (
                <SetValueConfig
                  selectedExercise={selectedExercise}
                  operatingSet={operatingSet}
                  setOperatingSet={setOperatingSet}
                  operationType={operationType}
                  useSetTrackingInputs={useSetTrackingInputs}
                  userSettings={userSettings}
                  resetSetInputValues={resetSetInputValues}
                  numMultisetSets={numMultisetSets}
                  openCalculationModal={openCalculationModal}
                  multisetSetTarget={multisetSetTarget}
                  setMultisetSetTarget={setMultisetSetTarget}
                />
              )}
            </ModalBody>
            <ModalFooter
              className={
                operationType === "add"
                  ? "flex justify-between items-center h-[5rem]"
                  : "flex justify-between items-center"
              }
            >
              <div>
                {isAddingExercise && (
                  <NumSetsDropdown
                    numNewSets={numNewSets}
                    targetType="state"
                    setNumNewSets={setNumNewSets}
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="light"
                  onPress={
                    isAddingExercise
                      ? () => setSelectedExercise(undefined)
                      : onClose
                  }
                >
                  {isAddingExercise ? "Back" : "Close"}
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    selectedExercise === undefined || isSetTrackingValuesInvalid
                  }
                  onPress={
                    operationType === "add-sets-to-multiset"
                      ? () => handleSaveSetButton(numNewSets, multisetSetTarget)
                      : () => handleSaveSetButton(numNewSets)
                  }
                >
                  {operationType === "edit" ? "Save" : "Add"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SetModal;

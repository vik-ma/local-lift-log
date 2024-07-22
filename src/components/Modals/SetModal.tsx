import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { ExerciseModalList, SetValueConfig } from "../";
import {
  Exercise,
  UserSettings,
  WorkoutSet,
  UseSetTrackingInputsReturnType,
  UseExerciseListReturnType,
} from "../../typings";
import { useState } from "react";

type SetModalProps = {
  setModal: ReturnType<typeof useDisclosure>;
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
  clearSetInputValues: (isOperatingSet: boolean) => void;
  userSettings: UserSettings;
  exerciseList: UseExerciseListReturnType;
  numMultisetSets?: number;
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
  clearSetInputValues,
  userSettings,
  exerciseList,
  numMultisetSets,
}: SetModalProps) => {
  const [numNewSets, setNumNewSets] = useState<string>("3");
  const [multisetSetTarget, setMultisetSetTarget] = useState<string>("1");

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
                />
              ) : (
                <SetValueConfig
                  selectedExercise={selectedExercise}
                  operatingSet={operatingSet}
                  setOperatingSet={setOperatingSet}
                  operationType={operationType}
                  useSetTrackingInputs={useSetTrackingInputs}
                  userSettings={userSettings}
                  clearSetInputValues={clearSetInputValues}
                  numNewSets={numNewSets}
                  setNumNewSets={setNumNewSets}
                  numMultisetSets={numMultisetSets}
                  multisetSetTarget={multisetSetTarget}
                  setMultisetSetTarget={setMultisetSetTarget}
                />
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {operationType === "add" && selectedExercise !== undefined && (
                  <Button
                    variant="flat"
                    color="danger"
                    onPress={() => setSelectedExercise(undefined)}
                  >
                    Change Exercise
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
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

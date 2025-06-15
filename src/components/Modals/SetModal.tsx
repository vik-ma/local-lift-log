import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Select,
  SelectItem,
} from "@heroui/react";
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
import { useEffect, useMemo, useState } from "react";
import {
  ConvertEmptyStringToNull,
  ConvertNullToEmptyInputString,
  ConvertSetInputValuesToNumbers,
  GetValidatedNumNewSets,
  NumNewSetsOptionList,
} from "../../helpers";
import { useSetTrackingInputs } from "../../hooks";

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
  handleSaveSetButton: (
    set: WorkoutSet,
    numSets: string,
    targetSet?: string
  ) => void;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
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
  handleSaveSetButton,
  userSettings,
  setUserSettings,
  exerciseList,
  numMultisetSets,
  openCalculationModal,
  useFilterExerciseList,
}: SetModalProps) => {
  const [noteInput, setNoteInput] = useState<string>("");

  const numSetsOptions = NumNewSetsOptionList();

  const [numNewSets, setNumNewSets] = useState<string>(
    GetValidatedNumNewSets(userSettings.default_num_new_sets, numSetsOptions)
  );
  const [multisetSetTarget, setMultisetSetTarget] = useState<string>("1");

  const isAddingExercise = useMemo(() => {
    return operationType === "add" && selectedExercise !== undefined;
  }, [operationType, selectedExercise]);

  const operatingSetInputs = useSetTrackingInputs();

  const {
    uneditedSet,
    setUneditedSet,
    isSetEdited,
    setIsSetEdited,
    assignSetTrackingValuesInputs,
    isSetTrackingValuesInvalid,
    setTrackingValuesInput,
  } = operatingSetInputs;

  const resetSetInputValues = () => {
    if (uneditedSet?.id !== operatingSet.id) return;

    const oldSet = { ...uneditedSet };
    setOperatingSet(oldSet);
    setIsSetEdited(false);
    assignSetTrackingValuesInputs(oldSet);
  };

  const handleSaveButton = () => {
    if (isSetTrackingValuesInvalid || selectedExercise === undefined) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      setTrackingValuesInput
    );

    const noteToInsert = ConvertEmptyStringToNull(noteInput);

    const templateSet: WorkoutSet = {
      ...operatingSet,
      exercise_id: selectedExercise.id,
      note: noteToInsert,
      exercise_name: selectedExercise.name,
      weight: setTrackingValuesNumber.weight,
      reps: setTrackingValuesNumber.reps,
      distance: setTrackingValuesNumber.distance,
      rir: setTrackingValuesNumber.rir,
      rpe: setTrackingValuesNumber.rpe,
      resistance_level: setTrackingValuesNumber.resistance_level,
      partial_reps: setTrackingValuesNumber.partial_reps,
      user_weight: setTrackingValuesNumber.user_weight,
    };

    if (operationType === "add-sets-to-multiset") {
      handleSaveSetButton(templateSet, "1", multisetSetTarget);
    } else {
      handleSaveSetButton(templateSet, numNewSets);
    }

    setIsSetEdited(false);
  };

  const handleNoteInputChange = (value: string) => {
    setNoteInput(value);

    if (!isSetEdited) {
      setIsSetEdited(true);
    }
  };

  useEffect(() => {
    assignSetTrackingValuesInputs(operatingSet);
    setUneditedSet({ ...operatingSet });
    setIsSetEdited(false);
    setNoteInput(ConvertNullToEmptyInputString(operatingSet.note));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingSet.id]);

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
                  useExerciseList={exerciseList}
                  useFilterExerciseList={useFilterExerciseList}
                  userSettings={userSettings}
                  setUserSettings={setUserSettings}
                />
              ) : (
                <SetValueConfig
                  selectedExercise={selectedExercise}
                  operatingSet={operatingSet}
                  setOperatingSet={setOperatingSet}
                  operationType={operationType}
                  useSetTrackingInputs={operatingSetInputs}
                  userSettings={userSettings}
                  resetSetInputValues={resetSetInputValues}
                  openCalculationModal={openCalculationModal}
                  noteInput={noteInput}
                  handleNoteInputChange={handleNoteInputChange}
                />
              )}
            </ModalBody>
            <ModalFooter
              className={
                operationType === "add" ||
                operationType === "add-sets-to-multiset"
                  ? "flex justify-between items-center h-[5rem]"
                  : "flex justify-between items-center"
              }
            >
              <div>
                {isAddingExercise && (
                  <NumSetsDropdown
                    numNewSets={numNewSets}
                    targetType="state"
                    numSetsOptions={numSetsOptions}
                    setNumNewSets={setNumNewSets}
                  />
                )}
                {operationType === "add-sets-to-multiset" &&
                  selectedExercise !== undefined &&
                  numMultisetSets !== undefined &&
                  multisetSetTarget !== undefined &&
                  setMultisetSetTarget !== undefined && (
                    <Select
                      className="w-[10.25rem]"
                      classNames={{
                        trigger: "bg-amber-50 border-amber-200",
                      }}
                      label="Add To Multiset Set"
                      size="sm"
                      variant="faded"
                      selectedKeys={[multisetSetTarget]}
                      onChange={(e) => setMultisetSetTarget(e.target.value)}
                      disallowEmptySelection
                    >
                      {Array.from({ length: numMultisetSets }, (_, i) =>
                        (i + 1).toString()
                      ).map((num) => (
                        <SelectItem key={num}>{num}</SelectItem>
                      ))}
                    </Select>
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
                  onPress={handleSaveButton}
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

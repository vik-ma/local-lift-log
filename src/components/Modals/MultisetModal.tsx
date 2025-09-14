import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Input,
  ScrollShadow,
} from "@heroui/react";
import {
  Multiset,
  Exercise,
  UseExerciseListReturnType,
  WorkoutSet,
  UserSettings,
  UseSetTrackingInputsReturnType,
} from "../../typings";
import {
  ExerciseModalList,
  MultisetSetList,
  MultisetTemplateModalList,
  SetValueConfig,
  MultisetTypeDropdown,
  NumSetsDropdown,
} from "../";
import { useMultisetActions, useSetTrackingInputs } from "../../hooks";
import { useEffect, useMemo, useState } from "react";
import {
  AssignTrackingValuesIfCardio,
  ConvertEmptyStringToNull,
  ConvertNullToEmptyInputString,
  ConvertSetInputValuesToNumbers,
  GetValidatedNumNewSets,
} from "../../helpers";
import { MODAL_BODY_HEIGHT, NUM_NEW_SETS_OPTIONS_LIST } from "../../constants";

type MultisetModalProps = {
  multiset: Multiset;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  operatingSet: WorkoutSet;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  operationType: string;
  handleClickExercise: (exercise: Exercise) => void;
  useMultisetActions: ReturnType<typeof useMultisetActions>;
  exerciseList: UseExerciseListReturnType;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  saveButtonAction: (noteInput: string, numSets?: string) => void;
  handleClickMultiset: (multiset: Multiset, numSets: string) => void;
  showWorkoutItems: boolean;
  openCalculationModal: (
    isWeight: boolean,
    exercise: Exercise,
    isActiveSet: boolean,
    setInputs: UseSetTrackingInputsReturnType,
    set: WorkoutSet
  ) => Promise<void>;
};

export const MultisetModal = ({
  multiset,
  setMultiset,
  operatingSet,
  setOperatingSet,
  operationType,
  handleClickExercise,
  useMultisetActions,
  exerciseList,
  userSettings,
  setUserSettings,
  saveButtonAction,
  handleClickMultiset,
  showWorkoutItems,
  openCalculationModal,
}: MultisetModalProps) => {
  const [multisetNoteInput, setMultisetNoteInput] = useState<string>("");

  const numSetsOptions = NUM_NEW_SETS_OPTIONS_LIST;

  const [numNewSets, setNumNewSets] = useState<string>(
    GetValidatedNumNewSets(userSettings.default_num_new_sets, numSetsOptions)
  );

  const {
    multisetModal,
    updateOperatingSet,
    undoOperatingMultisetChanges,
    setMultisetSetOperationType,
  } = useMultisetActions;

  const operatingSetInputs = useSetTrackingInputs();

  const {
    uneditedSet,
    setUneditedSet,
    isSetEdited,
    setIsSetEdited,
    assignSetTrackingValuesInputs,
    isSetTrackingValuesInvalid,
    setTrackingValuesInput,
    setNoteInput,
    timeInSeconds,
  } = operatingSetInputs;

  const resetSetInputValues = () => {
    if (
      uneditedSet?.id !== operatingSet.id ||
      selectedMultisetExercise === undefined
    )
      return;

    // Reset is_tracking values only if creating new Set
    const oldSet =
      operatingSet.id === 0
        ? AssignTrackingValuesIfCardio(
            uneditedSet,
            selectedMultisetExercise.formattedGroupStringPrimary ?? ""
          )
        : { ...uneditedSet };

    setOperatingSet(oldSet);
    setIsSetEdited(false);
    assignSetTrackingValuesInputs(oldSet);
  };

  const showClearAllButton = useMemo(() => {
    return (
      multiset.id === 0 &&
      (multiset.setList.length > 0 ||
        multiset.note !== "" ||
        multiset.multiset_type !== 0)
    );
  }, [multiset]);

  const {
    modalPage,
    setModalPage,
    selectedMultisetExercise,
    handleMultisetSetOptionSelection,
    closeMultisetModal,
    clearMultiset,
  } = useMultisetActions;

  const isAddingMultisetToWorkout = useMemo(() => {
    return showWorkoutItems && operationType === "add";
  }, [showWorkoutItems, operationType]);

  const shouldBackButtonClose = useMemo(() => {
    if (modalPage === "edit-set" || modalPage === "exercise-list") return false;

    if (modalPage === "base" && isAddingMultisetToWorkout) return false;

    return true;
  }, [modalPage, isAddingMultisetToWorkout]);

  const handleAddExerciseButton = () => {
    setMultisetSetOperationType("add");
    setModalPage("exercise-list");
  };

  const handleSaveSetButton = () => {
    if (isSetTrackingValuesInvalid || !isSetEdited) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      setTrackingValuesInput
    );

    const noteToInsert = ConvertEmptyStringToNull(setNoteInput);

    const updatedSet: WorkoutSet = {
      ...operatingSet,
      note: noteToInsert,
      weight: setTrackingValuesNumber.weight,
      reps: setTrackingValuesNumber.reps,
      time_in_seconds: timeInSeconds,
      distance: setTrackingValuesNumber.distance,
      rir: setTrackingValuesNumber.rir,
      rpe: setTrackingValuesNumber.rpe,
      resistance_level: setTrackingValuesNumber.resistance_level,
      partial_reps: setTrackingValuesNumber.partial_reps,
      user_weight: setTrackingValuesNumber.user_weight,
      isEditedInMultiset: true,
      addCalculationTrigger: undefined,
    };

    updateOperatingSet(updatedSet);

    setIsSetEdited(false);
  };

  const handleMultisetNoteInputChange = (value: string) => {
    setMultisetNoteInput(value);

    if (!multiset.isEditedInModal) {
      setMultiset((prev) => ({
        ...prev,
        isEditedInModal: true,
      }));
    }
  };

  const handleUndoChangesButton = () => {
    setMultisetNoteInput(ConvertNullToEmptyInputString(multiset.note));

    undoOperatingMultisetChanges();
  };

  useEffect(() => {
    assignSetTrackingValuesInputs(operatingSet);
    setUneditedSet({ ...operatingSet });
    setIsSetEdited(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingSet.id]);

  useEffect(() => {
    setMultisetNoteInput(ConvertNullToEmptyInputString(multiset.note));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiset.id]);

  return (
    <Modal isOpen={multisetModal.isOpen} onOpenChange={closeMultisetModal}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {modalPage === "multiset-list"
                ? "Select Multiset Template"
                : modalPage === "exercise-list"
                ? "Select Exercise"
                : modalPage === "edit-set"
                ? "Edit Set"
                : isAddingMultisetToWorkout && modalPage === "base"
                ? "Add Multiset"
                : operationType === "add"
                ? "Create Multiset"
                : "Edit Multiset"}
            </ModalHeader>
            <ModalBody className="py-0">
              {modalPage === "exercise-list" ? (
                <ExerciseModalList
                  handleClickExercise={handleClickExercise}
                  useExerciseList={exerciseList}
                  userSettings={userSettings}
                  setUserSettings={setUserSettings}
                />
              ) : modalPage === "edit-set" ? (
                <SetValueConfig
                  selectedExercise={selectedMultisetExercise}
                  operatingSet={operatingSet}
                  setOperatingSet={setOperatingSet}
                  operationType={"edit"}
                  useSetTrackingInputs={operatingSetInputs}
                  userSettings={userSettings}
                  resetSetInputValues={resetSetInputValues}
                  isMultiset={true}
                  openCalculationModal={openCalculationModal}
                />
              ) : modalPage === "multiset-list" ? (
                <MultisetTemplateModalList
                  useMultisetActions={useMultisetActions}
                  handleClickMultiset={handleClickMultiset}
                  numNewSets={numNewSets}
                  setModalPage={setModalPage}
                  userSettings={userSettings}
                />
              ) : (
                <div
                  className={`${MODAL_BODY_HEIGHT} flex flex-col items-center gap-1.5`}
                >
                  <div className="flex items-center gap-2">
                    <MultisetTypeDropdown
                      multiset_type={multiset.multiset_type}
                      setMultiset={setMultiset}
                    />
                    <Input
                      value={multisetNoteInput}
                      className="w-64"
                      label="Note"
                      labelPlacement="outside-left"
                      variant="faded"
                      onValueChange={(value) =>
                        handleMultisetNoteInputChange(value)
                      }
                      isClearable
                    />
                  </div>
                  <div className="flex gap-1 w-full justify-between">
                    <Button
                      color="secondary"
                      variant="flat"
                      size="sm"
                      onPress={handleAddExerciseButton}
                    >
                      Add Exercise
                    </Button>
                    {multiset.isEditedInModal && multiset.id !== 0 && (
                      <Button
                        variant="flat"
                        size="sm"
                        onPress={handleUndoChangesButton}
                      >
                        Undo Changes
                      </Button>
                    )}
                    {showClearAllButton && (
                      <Button
                        variant="flat"
                        size="sm"
                        onPress={() => clearMultiset()}
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  <ScrollShadow className="w-full">
                    <MultisetSetList
                      multiset={multiset}
                      setMultiset={setMultiset}
                      handleMultisetSetOptionSelection={
                        handleMultisetSetOptionSelection
                      }
                    />
                  </ScrollShadow>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between items-center">
              <div>
                {isAddingMultisetToWorkout &&
                  (modalPage === "base" || modalPage === "multiset-list") && (
                    <NumSetsDropdown
                      numNewSets={numNewSets}
                      targetType="state"
                      numSetsOptions={numSetsOptions}
                      setNumNewSets={setNumNewSets}
                    />
                  )}
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="light"
                  onPress={
                    shouldBackButtonClose
                      ? onClose
                      : !shouldBackButtonClose && modalPage === "base"
                      ? () => setModalPage("multiset-list")
                      : () => setModalPage("base")
                  }
                >
                  {shouldBackButtonClose ? "Close" : "Back"}
                </Button>
                {modalPage !== "multiset-list" && (
                  <Button
                    className={
                      modalPage === "edit-set" ? "w-[6.5rem]" : "w-[4rem]"
                    }
                    color="primary"
                    isDisabled={
                      modalPage === "exercise-list" ||
                      (modalPage !== "edit-set" &&
                        multiset.setList.length === 0) ||
                      (modalPage === "edit-set" &&
                        (operatingSetInputs.isSetTrackingValuesInvalid ||
                          !operatingSetInputs.isSetEdited))
                    }
                    onPress={
                      modalPage === "edit-set"
                        ? handleSaveSetButton
                        : () => saveButtonAction(multisetNoteInput, numNewSets)
                    }
                  >
                    {modalPage === "edit-set" ? "Update Set" : "Save"}
                  </Button>
                )}
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MultisetModal;

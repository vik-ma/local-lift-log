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
  UseFilterExerciseListReturnType,
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
  ConvertEmptyStringToNull,
  ConvertSetInputValuesToNumbers,
  GetValidatedNumNewSets,
  NumNewSetsOptionList,
} from "../../helpers";

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
  saveButtonAction: (numSets?: string) => void;
  handleClickMultiset: (multiset: Multiset, numSets: string) => void;
  showWorkoutItems: boolean;
  openCalculationModal: (
    isWeight: boolean,
    exercise: Exercise,
    isActiveSet: boolean,
    setInputs: UseSetTrackingInputsReturnType,
    set: WorkoutSet
  ) => Promise<void>;
  useFilterExerciseList: UseFilterExerciseListReturnType;
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
  useFilterExerciseList,
}: MultisetModalProps) => {
  const numSetsOptions = NumNewSetsOptionList();

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

  const resetSetInputValues = () => {
    if (operatingSetInputs.uneditedSet?.id !== operatingSet.id) return;

    const oldSet = { ...operatingSetInputs.uneditedSet };
    setOperatingSet(oldSet);
    operatingSetInputs.setIsSetEdited(false);
    operatingSetInputs.assignSetTrackingValuesInputs(oldSet);
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
    if (
      operatingSetInputs.isSetTrackingValuesInvalid ||
      !operatingSetInputs.isSetEdited
    )
      return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      operatingSetInputs.setTrackingValuesInput
    );

    const noteToInsert = ConvertEmptyStringToNull(operatingSet.note);

    const updatedSet: WorkoutSet = {
      ...operatingSet,
      note: noteToInsert,
      weight: setTrackingValuesNumber.weight,
      reps: setTrackingValuesNumber.reps,
      distance: setTrackingValuesNumber.distance,
      rir: setTrackingValuesNumber.rir,
      rpe: setTrackingValuesNumber.rpe,
      resistance_level: setTrackingValuesNumber.resistance_level,
      partial_reps: setTrackingValuesNumber.partial_reps,
      user_weight: setTrackingValuesNumber.user_weight,
      isEditedInMultiset: true,
    };

    updateOperatingSet(updatedSet);

    operatingSetInputs.setIsSetEdited(false);
  };

  useEffect(() => {
    operatingSetInputs.assignSetTrackingValuesInputs(operatingSet);
    operatingSetInputs.setUneditedSet({ ...operatingSet });
    operatingSetInputs.setIsSetEdited(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingSet.id]);

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
            <ModalBody>
              {modalPage === "exercise-list" ? (
                <ExerciseModalList
                  handleClickExercise={handleClickExercise}
                  useExerciseList={exerciseList}
                  useFilterExerciseList={useFilterExerciseList}
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
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 h-[400px]">
                  <div className="flex items-center gap-2">
                    <MultisetTypeDropdown
                      multiset_type={multiset.multiset_type}
                      setMultiset={setMultiset}
                    />
                    <Input
                      value={multiset.note ?? ""}
                      className="w-64"
                      label="Note"
                      labelPlacement="outside-left"
                      variant="faded"
                      onValueChange={(value) =>
                        setMultiset((prev) => ({
                          ...prev,
                          note: value,
                          isEditedInModal: true,
                        }))
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
                        onPress={undoOperatingMultisetChanges}
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
            <ModalFooter
              className={
                operationType === "add"
                  ? "flex justify-between items-center h-[5rem]"
                  : "flex justify-between items-center"
              }
            >
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
                        : () => saveButtonAction(numNewSets)
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

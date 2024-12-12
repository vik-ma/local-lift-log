import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  ScrollShadow,
} from "@nextui-org/react";
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
} from "../";
import { useMultisetActions, useNumSetsOptions } from "../../hooks";
import { useMemo, useState } from "react";

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
  saveButtonAction: (numSets?: string) => void;
  handleClickMultiset: (multiset: Multiset, numSets: string) => void;
  showWorkoutItems: boolean;
  operatingSetInputs: UseSetTrackingInputsReturnType;
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
  saveButtonAction,
  handleClickMultiset,
  showWorkoutItems,
  operatingSetInputs,
  openCalculationModal,
  useFilterExerciseList,
}: MultisetModalProps) => {
  const [numNewSets, setNumNewSets] = useState<string>("3");

  const numSetsOptions = useNumSetsOptions();

  const { multisetModal, updateOperatingSet, undoOperatingMultisetChanges } =
    useMultisetActions;

  const resetSetInputValues = () => {
    if (operatingSetInputs.uneditedSet?.id !== operatingSet.id) return;

    const oldSet = { ...operatingSetInputs.uneditedSet };
    setOperatingSet(oldSet);
    operatingSetInputs.setIsSetEdited(false);
    operatingSetInputs.setTrackingValuesInputStrings(oldSet);
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

  const shouldBackButtonClose = useMemo(() => {
    if (modalPage === "edit-set" || modalPage === "exercise-list") return false;

    if (showWorkoutItems && modalPage === "base") return false;

    return true;
  }, [modalPage, showWorkoutItems]);

  return (
    <Modal isOpen={multisetModal.isOpen} onOpenChange={closeMultisetModal}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {modalPage === "multiset-list"
                ? "Select Multiset"
                : modalPage === "exercise-list"
                ? "Select Exercise"
                : modalPage === "edit-set"
                ? "Edit Set"
                : operationType === "add"
                ? "Create Multiset"
                : "Edit Multiset"}
              {modalPage === "base" && showWorkoutItems && (
                <Button
                  className="absolute right-10"
                  variant="flat"
                  size="sm"
                  onPress={() => setModalPage("multiset-list")}
                >
                  Select Multiset Template
                </Button>
              )}
            </ModalHeader>
            <ModalBody>
              {modalPage === "exercise-list" ? (
                <ExerciseModalList
                  handleClickExercise={handleClickExercise}
                  exerciseList={exerciseList}
                  useFilterExerciseList={useFilterExerciseList}
                  userSettingsId={userSettings.id}
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
                  setNumNewSets={setNumNewSets}
                  numSetsOptions={numSetsOptions}
                  setModalPage={setModalPage}
                />
              ) : (
                <div className="flex flex-col items-center gap-2.5 h-[400px]">
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
                  {showWorkoutItems && operationType === "add" && (
                    <Select
                      label="Number Of Sets To Add"
                      size="sm"
                      variant="faded"
                      classNames={{
                        trigger: "bg-amber-50 border-amber-200",
                      }}
                      selectedKeys={[numNewSets]}
                      onChange={(e) => setNumNewSets(e.target.value)}
                      disallowEmptySelection
                    >
                      {numSetsOptions.map((num) => (
                        <SelectItem key={num} value={num}>
                          {num}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                  <ScrollShadow className="w-full">
                    <MultisetSetList
                      multiset={multiset}
                      setMultiset={setMultiset}
                      handleMultisetSetOptionSelection={
                        handleMultisetSetOptionSelection
                      }
                    />
                  </ScrollShadow>
                  <div>
                    {showClearAllButton && (
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => clearMultiset()}
                      >
                        Clear All
                      </Button>
                    )}
                    {multiset.isEditedInModal && multiset.id !== 0 && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onClick={undoOperatingMultisetChanges}
                      >
                        Undo Changes
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div></div>
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
                      operatingSetInputs.isSetTrackingValuesInvalid)
                  }
                  onPress={
                    modalPage === "edit-set"
                      ? updateOperatingSet
                      : () => saveButtonAction(numNewSets)
                  }
                >
                  {modalPage === "edit-set"
                    ? "Update Set"
                    : modalPage === "multiset-list"
                    ? "Add"
                    : "Save"}
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

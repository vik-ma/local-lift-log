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
  UseDisclosureReturnType,
  PresetsType,
  UseCalculationModalReturnType,
} from "../../typings";
import {
  ExerciseModalList,
  MultisetSetList,
  MultisetTemplateModalList,
  SetValueConfig,
  MultisetDropdown,
} from "../";
import { useMultisetActions, useNumSetsOptions } from "../../hooks";
import { useMemo, useState } from "react";

type MultisetModalProps = {
  multisetModal: UseDisclosureReturnType;
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
  updateOperatingSet: () => void;
  handleClickMultiset: (multiset: Multiset, numSets: string) => void;
  showWorkoutItems: boolean;
  operatingSetInputs: UseSetTrackingInputsReturnType;
  undoOperatingMultisetChanges: () => void;
  setPresetsType: React.Dispatch<React.SetStateAction<PresetsType>>;
  calculationModal: UseCalculationModalReturnType;
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
  handleClickMultiset,
  showWorkoutItems,
  operatingSetInputs,
  undoOperatingMultisetChanges,
  setPresetsType,
  calculationModal,
}: MultisetModalProps) => {
  const [numNewSets, setNumNewSets] = useState<string>("3");

  const numSetsOptions = useNumSetsOptions();

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
    filterQuery,
    setFilterQuery,
    filteredMultisets,
    multisetTypeMap,
    clearMultiset,
    multisets,
  } = useMultisetActions;

  const handleLeftButton = () => {
    if (
      modalPage === "exercise-list" ||
      modalPage === "edit-set" ||
      modalPage === "multiset-list"
    )
      setModalPage("base");

    if (modalPage === "base") setModalPage("exercise-list");
  };

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
                  setPresetsType={setPresetsType}
                  calculationModal={calculationModal}
                />
              ) : modalPage === "multiset-list" ? (
                <MultisetTemplateModalList
                  handleClickMultiset={handleClickMultiset}
                  filterQuery={filterQuery}
                  setFilterQuery={setFilterQuery}
                  filteredMultisets={filteredMultisets}
                  multisetTypeMap={multisetTypeMap}
                  numNewSets={numNewSets}
                  setNumNewSets={setNumNewSets}
                  numSetsOptions={numSetsOptions}
                  multisets={multisets}
                />
              ) : (
                <div className="flex flex-col items-center gap-2.5 h-[400px]">
                  <div className="flex items-center gap-2">
                    <MultisetDropdown
                      multiset_type={multiset.multiset_type}
                      setMultiset={setMultiset}
                      isInModal={true}
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
              <div className="flex">
                <Button
                  className={
                    modalPage === "multiset-list" ? "w-[10rem]" : "w-[7.5rem]"
                  }
                  variant="flat"
                  onPress={() => handleLeftButton()}
                >
                  {modalPage === "multiset-list"
                    ? "Create New Multiset"
                    : modalPage === "exercise-list"
                    ? "Cancel"
                    : modalPage === "edit-set"
                    ? "Back"
                    : "Add Exercise"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                {modalPage !== "multiset-list" && (
                  <Button
                    className="w-[6.5rem]"
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

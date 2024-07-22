import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  Multiset,
  Exercise,
  UseExerciseListReturnType,
  WorkoutSet,
  UserSettings,
} from "../../typings";
import {
  ExerciseModalList,
  MultisetSetList,
  MultisetTemplateModalList,
  SetValueConfig,
  MultisetDropdown,
} from "../";
import {
  useSetTrackingInputs,
  useDefaultSetInputValues,
  useMultisetActions,
  useNumSetsOptions,
} from "../../hooks";
import { useMemo, useState } from "react";

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
  saveButtonAction: (numSets?: string) => void;
  updateOperatingSet: () => void;
  handleClickMultiset: (multiset: Multiset, numSets: string) => void;
  showWorkoutItems: boolean;
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
}: MultisetModalProps) => {
  const [numNewSets, setNumNewSets] = useState<string>("3");

  const numSetsOptions = useNumSetsOptions();

  const defaultSetInputValues = useDefaultSetInputValues();

  const operatingSetInputs = useSetTrackingInputs();

  const clearSetInputValues = () => {
    operatingSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
    setOperatingSet({
      ...operatingSet,
      time_in_seconds: 0,
    });
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
                  clearSetInputValues={clearSetInputValues}
                  isMultiset={true}
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
                />
              ) : (
                <div className="flex flex-col items-center gap-2.5 h-[400px] overflow-auto scroll-gradient">
                  <div className="flex items-center gap-2">
                    <MultisetDropdown
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
                  <MultisetSetList
                    multiset={multiset}
                    setMultiset={setMultiset}
                    handleMultisetSetOptionSelection={
                      handleMultisetSetOptionSelection
                    }
                  />
                  {showClearAllButton && (
                    <Button size="sm" variant="flat" onClick={clearMultiset}>
                      Clear All
                    </Button>
                  )}
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
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                {modalPage !== "multiset-list" && (
                  <Button
                    className="w-[6.5rem]"
                    color="success"
                    isDisabled={
                      (modalPage !== "edit-set" &&
                        multiset.setList.length === 0) ||
                      (modalPage === "edit-set" && operatingSet.id < 1)
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

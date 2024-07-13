import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import {
  Multiset,
  Exercise,
  UseExerciseListReturnType,
  WorkoutSet,
  UserSettings,
} from "../../typings";
import { MultisetDropdown } from "../Dropdowns/MultisetDropdown";
import {
  ExerciseModalList,
  MultisetSetList,
  MultisetTemplateModalList,
  SetValueConfig,
} from "../";
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
  handleClickMultiset: (multiset: Multiset) => void;
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
    modalPage,
    setModalPage,
    selectedMultisetExercise,
    handleMultisetSetOptionSelection,
    closeMultisetModal,
    filterQuery,
    setFilterQuery,
    filteredMultisets,
    multisetTypeMap,
  } = useMultisetActions;

  const handleLeftButton = () => {
    if (modalPage === "exercise-list" || modalPage === "edit-set")
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
              <div className="flex">
                {modalPage !== "multiset-list" && (
                  <Button
                    className="w-[7.5rem]"
                    variant="flat"
                    onPress={() => handleLeftButton()}
                  >
                    {modalPage === "exercise-list"
                      ? "Cancel"
                      : modalPage === "edit-set"
                      ? "Back"
                      : "Add Exercise"}
                  </Button>
                )}
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
                        : saveButtonAction
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

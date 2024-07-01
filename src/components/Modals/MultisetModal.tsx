import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Multiset, Exercise, UseExerciseListReturnType } from "../../typings";
import { MultisetDropdown } from "../Dropdowns/MultisetDropdown";
import { ExerciseModalList } from "../";

type MultisetModalProps = {
  multisetModal: ReturnType<typeof useDisclosure>;
  multiset: Multiset;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  operationType: string;
  handleClickExercise: (exercise: Exercise) => void;
  isSelectingExercise: boolean;
  setIsSelectingExercise: React.Dispatch<React.SetStateAction<boolean>>;
  exerciseList: UseExerciseListReturnType;
};

export const MultisetModal = ({
  multisetModal,
  multiset,
  setMultiset,
  operationType,
  handleClickExercise,
  isSelectingExercise,
  setIsSelectingExercise,
  exerciseList,
}: MultisetModalProps) => {
  return (
    <Modal
      isOpen={multisetModal.isOpen}
      onOpenChange={multisetModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {isSelectingExercise
                ? "Select Exercise"
                : operationType === "add"
                ? "Create Multiset"
                : "Edit Multiset"}
            </ModalHeader>
            <ModalBody>
              {isSelectingExercise ? (
                <ExerciseModalList
                  handleClickExercise={handleClickExercise}
                  exerciseList={exerciseList}
                />
              ) : (
                <div className="flex flex-col gap-2 h-[400px]">
                  <MultisetDropdown
                    multiset_type={multiset.multiset_type}
                    setMultiset={setMultiset}
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                <Button
                  variant="flat"
                  onPress={() => setIsSelectingExercise(!isSelectingExercise)}
                >
                  {isSelectingExercise ? "Cancel" : "Add Exercise"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  // TODO: CHANGE TO SET COLLECTION
                  isDisabled={multiset.set_order === ""}
                  onPress={() => {}}
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

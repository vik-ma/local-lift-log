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
import { ExerciseModalList, MultisetSetList } from "../";

type MultisetModalProps = {
  multisetModal: ReturnType<typeof useDisclosure>;
  multiset: Multiset;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  operationType: string;
  handleClickExercise: (exercise: Exercise) => void;
  isSelectingExercise: boolean;
  setIsSelectingExercise: React.Dispatch<React.SetStateAction<boolean>>;
  exerciseList: UseExerciseListReturnType;
  saveButtonAction: () => void;
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
  saveButtonAction,
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
                <div className="flex flex-col items-center gap-2.5 h-[400px] overflow-auto scroll-gradient">
                  <MultisetDropdown
                    multiset_type={multiset.multiset_type}
                    setMultiset={setMultiset}
                  />
                  <MultisetSetList multiset={multiset} />
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
                  isDisabled={multiset.setList.length === 0}
                  onPress={saveButtonAction}
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

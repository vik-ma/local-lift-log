import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Input,
  ScrollShadow,
  useDisclosure,
} from "@nextui-org/react";
import { Multiset, Exercise } from "../../typings";
import { useExerciseList } from "../../hooks";
import { MultisetDropdown } from "../Dropdowns/MultisetDropdown";
import { SearchIcon } from "../../assets";

type MultisetModalProps = {
  multisetModal: ReturnType<typeof useDisclosure>;
  multiset: Multiset;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  selectedExercise: Exercise | undefined;
  setSelectedExercise: React.Dispatch<
    React.SetStateAction<Exercise | undefined>
  >;
  operationType: string;
};

export const MultisetModal = ({
  multisetModal,
  multiset,
  setMultiset,
  selectedExercise,
  setSelectedExercise,
  operationType,
}: MultisetModalProps) => {
  const { filterQuery, setFilterQuery, filteredExercises } = useExerciseList();

  return (
    <Modal
      isOpen={multisetModal.isOpen}
      onOpenChange={multisetModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {selectedExercise === undefined
                ? "Select Exercise"
                : operationType === "add"
                ? "Create Multiset"
                : "Edit Multiset"}
            </ModalHeader>
            <ModalBody>
              {selectedExercise === undefined ? (
                <div className="h-[400px] flex flex-col gap-2">
                  <Input
                    label="Search"
                    variant="faded"
                    placeholder="Type to search..."
                    isClearable
                    value={filterQuery}
                    onValueChange={setFilterQuery}
                    startContent={<SearchIcon />}
                  />
                  <ScrollShadow className="flex flex-col gap-1">
                    {filteredExercises.map((exercise) => (
                      <button
                        key={exercise.id}
                        className="flex flex-col justify-start items-start bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:bg-default-200 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                        // onClick={() => handleClickExercise(exercise)}
                      >
                        <span className="text-md max-w-full truncate">
                          {exercise.name}
                        </span>
                        <span className="text-xs text-stone-400 text-left">
                          {exercise.formattedGroupString}
                        </span>
                      </button>
                    ))}
                  </ScrollShadow>
                </div>
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
                  isDisabled={selectedExercise === undefined}
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

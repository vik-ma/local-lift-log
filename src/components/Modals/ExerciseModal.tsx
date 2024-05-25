import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Checkbox,
  CheckboxGroup,
} from "@nextui-org/react";
import { Exercise } from "../../typings";
import { ExerciseGroupMap } from "../../helpers/Constants/ExerciseGroupDictionary";

type ExerciseModalProps = {
  exerciseModal: ReturnType<typeof useDisclosure>;
  exercise: Exercise;
  setExercise: React.Dispatch<React.SetStateAction<Exercise>>;
  isExerciseNameValid: boolean;
  exerciseGroupStringList: string[];
  isExerciseGroupSetStringValid: boolean;
  exerciseGroupDictionary: ExerciseGroupMap;
  handleExerciseGroupStringChange: (exerciseGroupStringList: string[]) => void;
  buttonAction: () => void;
};

export const ExerciseModal = ({
  exerciseModal,
  exercise,
  setExercise,
  isExerciseNameValid,
  exerciseGroupStringList,
  isExerciseGroupSetStringValid,
  exerciseGroupDictionary,
  handleExerciseGroupStringChange,
  buttonAction,
}: ExerciseModalProps) => {
  return (
    <Modal
      isOpen={exerciseModal.isOpen}
      onOpenChange={exerciseModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              New Exercise
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-0.5">
                <Input
                  className="h-[5rem]"
                  value={exercise.name}
                  isInvalid={!isExerciseNameValid}
                  label="Name"
                  errorMessage={!isExerciseNameValid && "Name can't be empty"}
                  variant="faded"
                  onValueChange={(value) =>
                    setExercise((prev) => ({ ...prev, name: value }))
                  }
                  isRequired
                  isClearable
                />
                <Input
                  value={exercise.note ?? ""}
                  label="Note"
                  variant="faded"
                  onValueChange={(value) =>
                    setExercise((prev) => ({ ...prev, note: value }))
                  }
                  isClearable
                />
              </div>
              <div>
                <CheckboxGroup
                  className="h-[17rem]"
                  isRequired
                  isInvalid={!isExerciseGroupSetStringValid}
                  defaultValue={exerciseGroupStringList}
                  label="Select Exercise Groups"
                  errorMessage={
                    !isExerciseGroupSetStringValid &&
                    "At least one Exercise Group must be selected"
                  }
                  onValueChange={(value) =>
                    handleExerciseGroupStringChange(value)
                  }
                >
                  <div className="grid grid-cols-2 gap-0.5">
                    {Array.from(exerciseGroupDictionary).map(([key, value]) => (
                      <Checkbox key={key} color="success" value={key}>
                        {value}
                      </Checkbox>
                    ))}
                  </div>
                </CheckboxGroup>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="success" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="success"
                onPress={buttonAction}
                isDisabled={
                  !isExerciseNameValid || !isExerciseGroupSetStringValid
                }
              >
                Create
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

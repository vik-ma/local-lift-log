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
import { Exercise, ExerciseGroupMap } from "../../typings";
import {
  ConvertExerciseGroupStringListToSetString,
  ConvertExerciseGroupSetString,
} from "../../helpers";

type ExerciseModalProps = {
  exerciseModal: ReturnType<typeof useDisclosure>;
  exercise: Exercise;
  setExercise: React.Dispatch<React.SetStateAction<Exercise>>;
  isExerciseNameValid: boolean;
  isExerciseGroupSetStringValid: boolean;
  exerciseGroupDictionary: ExerciseGroupMap;
  buttonAction: () => void;
  isEditing: boolean;
};

export const ExerciseModal = ({
  exerciseModal,
  exercise,
  setExercise,
  isExerciseNameValid,
  isExerciseGroupSetStringValid,
  exerciseGroupDictionary,
  buttonAction,
  isEditing,
}: ExerciseModalProps) => {
  const handleExerciseGroupStringChange = (
    exerciseGroupStringList: string[]
  ) => {
    const exerciseGroupSetString = ConvertExerciseGroupStringListToSetString(
      exerciseGroupStringList
    );

    const convertedValues = ConvertExerciseGroupSetString(
      exerciseGroupSetString
    );

    setExercise((prev) => ({
      ...prev,
      exercise_group_set_string: exerciseGroupSetString,
      exerciseGroupStringList: exerciseGroupStringList,
      formattedGroupString: convertedValues.formattedString,
    }));
  };

  return (
    <Modal
      isOpen={exerciseModal.isOpen}
      onOpenChange={exerciseModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {exercise.id === 0 ? "New" : "Edit"} Exercise
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
                  defaultValue={exercise.exerciseGroupStringList}
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
                {isEditing ? "Save" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

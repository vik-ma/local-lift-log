import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { Exercise, UseDisclosureReturnType } from "../../typings";
import {
  ConvertExerciseGroupStringListToSetString,
  ConvertExerciseGroupSetString,
} from "../../helpers";
import { ExerciseGroupCheckboxes } from "..";

type ExerciseModalProps = {
  exerciseModal: UseDisclosureReturnType;
  exercise: Exercise;
  setExercise: React.Dispatch<React.SetStateAction<Exercise>>;
  isExerciseNameValid: boolean;
  isExerciseGroupSetStringValid: boolean;
  exerciseGroupList: string[];
  buttonAction: () => void;
};

export const ExerciseModal = ({
  exerciseModal,
  exercise,
  setExercise,
  isExerciseNameValid,
  isExerciseGroupSetStringValid,
  exerciseGroupList,
  buttonAction,
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
            <ModalHeader>
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
              <ExerciseGroupCheckboxes
                isValid={isExerciseGroupSetStringValid}
                value={exercise.exerciseGroupStringList ?? []}
                handleChange={handleExerciseGroupStringChange}
                exerciseGroupList={exerciseGroupList}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={buttonAction}
                isDisabled={
                  !isExerciseNameValid || !isExerciseGroupSetStringValid
                }
              >
                {exercise.id !== 0 ? "Save" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

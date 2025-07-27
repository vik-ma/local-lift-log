import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import { WorkoutTemplate, UseDisclosureReturnType } from "../../typings";
import { useEffect, useState } from "react";
import { useValidateName } from "../../hooks";
import {
  ConvertEmptyStringToNull,
  ConvertNullToEmptyInputString,
} from "../../helpers";

type WorkoutTemplateModalProps = {
  workoutTemplateModal: UseDisclosureReturnType;
  workoutTemplate: WorkoutTemplate;
  buttonAction: (workoutTemplate: WorkoutTemplate) => void;
  resetInputsAfterSaving?: boolean;
};

export const WorkoutTemplateModal = ({
  workoutTemplateModal,
  workoutTemplate,
  buttonAction,
  resetInputsAfterSaving,
}: WorkoutTemplateModalProps) => {
  const [nameInput, setNameInput] = useState<string>("");
  const [noteInput, setNoteInput] = useState<string>("");

  const isNameValid = useValidateName({ name: nameInput });

  useEffect(() => {
    setNameInput(workoutTemplate.name);
    setNoteInput(ConvertNullToEmptyInputString(workoutTemplate.note));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutTemplate.id]);

  const handleSaveButton = () => {
    if (!isNameValid) return;

    const noteToInsert = ConvertEmptyStringToNull(noteInput);

    const updatedWorkoutTemplate: WorkoutTemplate = {
      ...workoutTemplate,
      name: nameInput,
      note: noteToInsert,
    };

    buttonAction(updatedWorkoutTemplate);

    if (resetInputsAfterSaving) resetInputs();
  };

  const resetInputs = () => {
    setNameInput("");
    setNoteInput("");
  };

  return (
    <Modal
      isOpen={workoutTemplateModal.isOpen}
      onOpenChange={workoutTemplateModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {workoutTemplate.id === 0 ? "New" : "Edit"} Workout Template
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-0.5">
                <Input
                  className="h-[5rem]"
                  value={nameInput}
                  isInvalid={!isNameValid}
                  label="Name"
                  errorMessage={!isNameValid && "Name can't be empty"}
                  variant="faded"
                  onValueChange={setNameInput}
                  isRequired
                  isClearable
                />
                <Input
                  value={noteInput}
                  label="Note"
                  variant="faded"
                  onValueChange={setNoteInput}
                  isClearable
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={handleSaveButton}
                isDisabled={!isNameValid}
              >
                {workoutTemplate.id !== 0 ? "Save" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

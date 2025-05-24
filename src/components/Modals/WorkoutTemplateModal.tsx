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

type WorkoutTemplateModalProps = {
  workoutTemplateModal: UseDisclosureReturnType;
  workoutTemplate: WorkoutTemplate;
  buttonAction: () => void;
};

export const WorkoutTemplateModal = ({
  workoutTemplateModal,
  workoutTemplate,
  buttonAction,
}: WorkoutTemplateModalProps) => {
  const [nameInput, setNameInput] = useState<string>("");
  const [noteInput, setNoteInput] = useState<string>("");

  const isNameValid = useValidateName(nameInput);

  useEffect(() => {
    setNameInput(workoutTemplate.name);
    setNoteInput(workoutTemplate.note ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutTemplate.id]);

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
                onPress={buttonAction}
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

import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { WorkoutTemplate, UseDisclosureReturnType } from "../../typings";

type WorkoutTemplateModalProps = {
  workoutTemplateModal: UseDisclosureReturnType;
  workoutTemplate: WorkoutTemplate;
  setWorkoutTemplate: React.Dispatch<React.SetStateAction<WorkoutTemplate>>;
  isWorkoutTemplateNameValid: boolean;
  buttonAction: () => void;
};

export const WorkoutTemplateModal = ({
  workoutTemplateModal,
  workoutTemplate,
  setWorkoutTemplate,
  isWorkoutTemplateNameValid,
  buttonAction,
}: WorkoutTemplateModalProps) => {
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
                  value={workoutTemplate.name}
                  isInvalid={!isWorkoutTemplateNameValid}
                  label="Name"
                  errorMessage={
                    !isWorkoutTemplateNameValid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={(value) =>
                    setWorkoutTemplate((prev) => ({
                      ...prev,
                      name: value,
                    }))
                  }
                  isRequired
                  isClearable
                />
                <Input
                  value={workoutTemplate.note ?? ""}
                  label="Note"
                  variant="faded"
                  onValueChange={(value) =>
                    setWorkoutTemplate((prev) => ({
                      ...prev,
                      note: value,
                    }))
                  }
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
                isDisabled={!isWorkoutTemplateNameValid}
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

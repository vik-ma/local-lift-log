import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { WorkoutTemplate } from "../../typings";

type WorkoutTemplateProps = {
  workoutTemplateModal: ReturnType<typeof useDisclosure>;
  workoutTemplate: WorkoutTemplate;
  setWorkoutTemplate: React.Dispatch<React.SetStateAction<WorkoutTemplate>>;
  isWorkoutTemplateNameValid: boolean;
  buttonAction: () => void;
  isEditing: boolean;
};

export const WorkoutTemplateModal = ({
  workoutTemplateModal,
  workoutTemplate,
  setWorkoutTemplate,
  isWorkoutTemplateNameValid,
  buttonAction,
  isEditing,
}: WorkoutTemplateProps) => {
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
              <Button color="success" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="success"
                onPress={buttonAction}
                isDisabled={!isWorkoutTemplateNameValid}
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

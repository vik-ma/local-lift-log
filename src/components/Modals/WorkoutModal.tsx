import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ScrollShadow,
} from "@nextui-org/react";
import { UseDisclosureReturnType, Workout } from "../../typings";
import { ConvertEmptyStringToNull } from "../../helpers";

type WorkoutModalProps = {
  workoutModal: UseDisclosureReturnType;
  workout: Workout;
  workoutNote: string;
  setWorkoutNote: React.Dispatch<React.SetStateAction<string>>;
  workoutTemplateNote: string | null;
  buttonAction: (updatedWorkout: Workout) => void;
  header?: string;
  handleChangeWorkoutTemplateButton?: () => void;
};

export const WorkoutModal = ({
  workoutModal,
  workout,
  workoutNote,
  setWorkoutNote,
  workoutTemplateNote,
  buttonAction,
  header = "Workout Details",
  handleChangeWorkoutTemplateButton,
}: WorkoutModalProps) => {
  const handleSaveButton = () => {
    const noteToInsert = ConvertEmptyStringToNull(workoutNote);

    const updatedWorkout: Workout = { ...workout, note: noteToInsert };

    buttonAction(updatedWorkout);
  };

  return (
    <Modal
      isOpen={workoutModal.isOpen}
      onOpenChange={workoutModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[440px]">
                <div className="flex flex-col gap-2">
                  {workoutTemplateNote && (
                    <div className="flex flex-col px-0.5">
                      <span className="font-medium text-secondary">
                        Workout Template Note
                      </span>
                      <span className="break-all text-stone-500">
                        {workoutTemplateNote}
                      </span>
                    </div>
                  )}
                  {workout.workoutTemplateName &&
                    handleChangeWorkoutTemplateButton && (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-secondary">
                          Workout Template
                        </span>
                        <div className="flex gap-1 items-center">
                          <span className="truncate w-[21rem] text-secondary">
                            {workout.workoutTemplateName}
                          </span>
                          <Button
                            variant="flat"
                            size="sm"
                            onPress={handleChangeWorkoutTemplateButton}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    )}
                  <div className="flex flex-col gap-1">
                    <span className="font-medium px-0.5">Workout Note</span>
                    <Input
                      aria-label="Workout Note Input"
                      value={workoutNote}
                      variant="faded"
                      onValueChange={(value) => setWorkoutNote(value)}
                      isClearable
                    />
                  </div>
                </div>
              </ScrollShadow>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleSaveButton}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { UseDisclosureReturnType, Workout } from "../../typings";
import { WorkoutRatingDropdown } from "../";
import { ConvertEmptyStringToNull } from "../../helpers";

type WorkoutModalProps = {
  workoutModal: UseDisclosureReturnType;
  workout: Workout;
  setWorkout: React.Dispatch<React.SetStateAction<Workout>>;
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
  setWorkout,
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
              <div className="flex flex-col gap-1.5">
                {workoutTemplateNote && (
                  <>
                    <span className="font-medium">Workout Template Note</span>
                    <span className="break-all">{workoutTemplateNote}</span>
                  </>
                )}
                {workout.workoutTemplateName &&
                  handleChangeWorkoutTemplateButton && (
                    <>
                      <span className="font-medium">
                        Workout Template
                      </span>
                      <div className="flex gap-1 items-center">
                        <span className="truncate w-[21rem] text-stone-500">
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
                    </>
                  )}
                <span className="font-medium">Workout Rating</span>
                <WorkoutRatingDropdown
                  rating={workout.rating}
                  setWorkout={setWorkout}
                />
                <span className="font-medium">Workout Note</span>
                <Input
                  className="col-span-2"
                  value={workoutNote}
                  size="sm"
                  label="Note"
                  variant="faded"
                  onValueChange={(value) => setWorkoutNote(value)}
                  isClearable
                />
              </div>
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

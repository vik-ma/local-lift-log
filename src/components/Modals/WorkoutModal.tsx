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
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 items-center">
                {workoutTemplateNote && (
                  <>
                    <span className="font-medium justify-self-end">
                      Workout Template Note
                    </span>
                    <span className="text-secondary break-all">
                      {workoutTemplateNote}
                    </span>
                  </>
                )}
                <span className="font-medium justify-self-end">
                  Workout Rating
                </span>
                <WorkoutRatingDropdown
                  rating={workout.rating}
                  setWorkout={setWorkout}
                />
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

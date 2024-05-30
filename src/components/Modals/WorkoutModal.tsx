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
import { Workout } from "../../typings";
import { WorkoutRatingDropdown } from "../Dropdowns/WorkoutRatingDropdown";

type WorkoutProps = {
  workoutModal: ReturnType<typeof useDisclosure>;
  workout: Workout;
  setWorkout: React.Dispatch<React.SetStateAction<Workout | undefined>>;
  workoutNote: string;
  setWorkoutNote: React.Dispatch<React.SetStateAction<string>>;
  buttonAction: () => void;
};

export const WorkoutModal = ({
  workoutModal,
  workout,
  setWorkout,
  workoutNote,
  setWorkoutNote,
  buttonAction,
}: WorkoutProps) => {
  return (
    <Modal
      isOpen={workoutModal.isOpen}
      onOpenChange={workoutModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Workout Details</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-6 justify-center">
                  <span className="font-medium">Workout Rating</span>
                  <WorkoutRatingDropdown
                    rating={workout.rating}
                    workout_id={workout.id}
                    isInModal={true}
                    setWorkout={setWorkout}
                  />
                </div>
                <Input
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
              <Button color="success" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="success" onPress={buttonAction}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

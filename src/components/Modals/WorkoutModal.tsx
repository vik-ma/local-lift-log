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
  workoutTemplateNote: string | null;
  buttonAction: () => void;
  showRating: boolean;
};

export const WorkoutModal = ({
  workoutModal,
  workout,
  setWorkout,
  workoutNote,
  setWorkoutNote,
  workoutTemplateNote,
  buttonAction,
  showRating,
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 items-center">
                {workoutTemplateNote && (
                  <>
                    <span className="font-medium justify-self-end">
                      Workout Template Note
                    </span>
                    <span className="text-yellow-600 break-all">
                      {workoutTemplateNote}sfdsfddsffdsdsdsdsdsdsdsdsdsdsdsds
                    </span>
                  </>
                )}
                {showRating && (
                  <>
                    <span className="font-medium justify-self-end">
                      Workout Rating
                    </span>
                    <WorkoutRatingDropdown
                      rating={workout.rating}
                      workout_id={workout.id}
                      isInModal={true}
                      setWorkout={setWorkout}
                    />
                  </>
                )}
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

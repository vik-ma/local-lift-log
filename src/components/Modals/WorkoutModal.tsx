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
  buttonAction: () => void;
};

export const WorkoutModal = ({
  workoutModal,
  workout,
  setWorkout,
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
              <div className="flex flex-col gap-0.5">
                <Input
                  value={workout.note ?? ""}
                  label="Note"
                  variant="faded"
                  onValueChange={(value) =>
                    setWorkout({
                      ...workout,
                      note: value,
                    })
                  }
                  isClearable
                />
                <WorkoutRatingDropdown
                  rating={workout.rating}
                  workout_id={workout.id}
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

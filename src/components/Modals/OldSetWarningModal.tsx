import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@heroui/react";
import { UseDisclosureReturnType, Workout } from "../../typings";
import {
  GetCurrentDateTimeISOString,
  GetNumberOfDaysBetweenDates,
} from "../../helpers";

type OldSetWarningModalProps = {
  oldSetWarningModal: UseDisclosureReturnType;
  workout: Workout;
  doneButtonAction: (saveOnToday: boolean) => void;
};

export const OldSetWarningModal = ({
  oldSetWarningModal,
  workout,
  doneButtonAction,
}: OldSetWarningModalProps) => {
  return (
    <Modal
      isOpen={oldSetWarningModal.isOpen}
      onOpenChange={oldSetWarningModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              Workout is{" "}
              {GetNumberOfDaysBetweenDates(
                "2025-06-28T13:12:33.836Z",
                GetCurrentDateTimeISOString()
              )}{" "}
              days old
            </ModalHeader>
            <ModalBody>
              <div className="h-16">
                Do you want to set the date for the completed Set as{" "}
                <span className="font-medium text-secondary">Today</span> or{" "}
                <span className="font-medium text-secondary">
                  {workout.formattedDate}
                </span>
                ?
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={() => doneButtonAction(true)}>
                Today
              </Button>
              <Button color="primary" onPress={() => doneButtonAction(false)}>
                {workout.formattedDate}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

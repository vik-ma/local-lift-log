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
};

export const OldSetWarningModal = ({
  oldSetWarningModal,
  workout,
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
                Do you want to set the date for the completed Set for{" "}
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
              {/* TODO: FIX */}
              {/* <Button color="primary" onPress={handleSaveButton}>
                Add
              </Button> */}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

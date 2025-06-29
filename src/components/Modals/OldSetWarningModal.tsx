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
            <ModalHeader>TODO: FIX</ModalHeader>
            <ModalBody>
              <div className="h-16">
                Workout is{" "}
                <span className="font-medium text-danger">
                  {GetNumberOfDaysBetweenDates(
                    "2025-06-28T13:12:33.836Z",
                    GetCurrentDateTimeISOString()
                  )}{" "}
                  days old
                </span>
                . Do you want to complete Set on{" "}
                <span className="font-medium text-secondary">
                  {workout.formattedDate}
                </span>{" "}
                or <span className="font-medium text-secondary">Today</span>?
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

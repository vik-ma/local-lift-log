import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Checkbox,
} from "@heroui/react";
import { UseDisclosureReturnType, Workout } from "../../typings";
import {
  GetCurrentDateTimeISOString,
  GetNumberOfDaysBetweenDates,
} from "../../helpers";

type OldSetWarningModalProps = {
  oldSetWarningModal: UseDisclosureReturnType;
  workout: Workout;
  setSaveOldSetOnToday: React.Dispatch<React.SetStateAction<boolean>>;
  doNotShowOldSetWarningModal: boolean;
  setDoNotShowOldSetWarningModal: React.Dispatch<React.SetStateAction<boolean>>;
  doneButtonAction: (saveOnToday: boolean) => void;
};

export const OldSetWarningModal = ({
  oldSetWarningModal,
  workout,
  setSaveOldSetOnToday,
  doNotShowOldSetWarningModal,
  setDoNotShowOldSetWarningModal,
  doneButtonAction,
}: OldSetWarningModalProps) => {
  const handleChoiceButton = (saveOnToday: boolean) => {
    setSaveOldSetOnToday(saveOnToday);
    doneButtonAction(saveOnToday);
  };

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
                workout.date,
                GetCurrentDateTimeISOString()
              )}{" "}
              days old
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col justify-between h-[4.625rem]">
                <div>
                  Do you want to set the date for the completed Set as{" "}
                  <span className="font-medium text-secondary">Today</span> or{" "}
                  <span className="font-medium text-secondary">
                    {workout.formattedDate}
                  </span>
                  ?
                </div>
                <div className="flex justify-end">
                  <Checkbox
                    className="hover:underline pt-0 pb-px"
                    color="primary"
                    isSelected={doNotShowOldSetWarningModal}
                    onValueChange={setDoNotShowOldSetWarningModal}
                  >
                    Do Not Show Warning Again For Workout
                  </Checkbox>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cancel
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  onPress={() => handleChoiceButton(true)}
                >
                  Today
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleChoiceButton(false)}
                >
                  {workout.formattedDate}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

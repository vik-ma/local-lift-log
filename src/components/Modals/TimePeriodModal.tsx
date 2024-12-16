import {
  TimePeriod,
  UseDisclosureReturnType,
  UseTimePeriodInputsReturnType,
} from "../../typings";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";

type TimePeriodModalProps = {
  timePeriodModal: UseDisclosureReturnType;
  timePeriod: TimePeriod;
  setTimePeriod: React.Dispatch<React.SetStateAction<TimePeriod>>;
  useTimePeriodInputs: UseTimePeriodInputsReturnType;
  buttonAction: () => void;
};

export const TimePeriodModal = ({
  timePeriodModal,
  timePeriod,
  setTimePeriod,
  useTimePeriodInputs,
  buttonAction,
}: TimePeriodModalProps) => {
  const { isTimePeriodValid, isTimePeriodNameValid, isStartDateValid } =
  useTimePeriodInputs;

  return (
    <Modal
      isOpen={timePeriodModal.isOpen}
      onOpenChange={timePeriodModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {timePeriod.id === 0 ? "New" : "Edit"} Time Period
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-1">
                <Input
                  className="h-[5rem]"
                  value={timePeriod.name}
                  isInvalid={!isTimePeriodNameValid}
                  label="Name"
                  errorMessage={!isTimePeriodNameValid && "Name can't be empty"}
                  variant="faded"
                  onValueChange={(value) =>
                    setTimePeriod((prev) => ({ ...prev, name: value }))
                  }
                  isRequired
                  isClearable
                />
                <div className="flex flex-col gap-2">
                  <Input
                    value={timePeriod.note ?? ""}
                    label="Note"
                    variant="faded"
                    onValueChange={(value) =>
                      setTimePeriod((prev) => ({ ...prev, note: value }))
                    }
                    isClearable
                  />
                  <Input
                    value={timePeriod.injury ?? ""}
                    label="Injury"
                    variant="faded"
                    onValueChange={(value) =>
                      setTimePeriod((prev) => ({ ...prev, injury: value }))
                    }
                    isClearable
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={buttonAction}
                isDisabled={!isTimePeriodValid}
              >
                {timePeriod.id !== 0 ? "Save" : "Create"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

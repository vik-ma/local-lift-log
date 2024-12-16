import { I18nProvider } from "@react-aria/i18n";
import {
  TimePeriod,
  UseDisclosureReturnType,
  UserSettings,
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
  DatePicker,
} from "@nextui-org/react";

type TimePeriodModalProps = {
  timePeriodModal: UseDisclosureReturnType;
  timePeriod: TimePeriod;
  setTimePeriod: React.Dispatch<React.SetStateAction<TimePeriod>>;
  useTimePeriodInputs: UseTimePeriodInputsReturnType;
  userSettings: UserSettings;
  buttonAction: () => void;
};

export const TimePeriodModal = ({
  timePeriodModal,
  timePeriod,
  setTimePeriod,
  useTimePeriodInputs,
  userSettings,
  buttonAction,
}: TimePeriodModalProps) => {
  const {
    isTimePeriodValid,
    isTimePeriodNameValid,
    isStartDateValid,
    isEndDateValid,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useTimePeriodInputs;

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
              <div className="flex flex-col">
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
                <div className="flex gap-4 justify-between pb-1.5">
                  <I18nProvider locale={userSettings.locale}>
                    <DatePicker
                      classNames={{ base: "gap-0.5" }}
                      dateInputClassNames={{ inputWrapper: "!bg-default-100" }}
                      label={
                        <span className="font-medium text-base px-0.5">
                          Start date
                        </span>
                      }
                      labelPlacement="outside"
                      variant="faded"
                      value={startDate}
                      onChange={setStartDate}
                      isInvalid={!isStartDateValid}
                      errorMessage="Start date must be selected"
                    />
                  </I18nProvider>
                  <I18nProvider locale={userSettings.locale}>
                    <DatePicker
                      classNames={{ base: "gap-0.5" }}
                      dateInputClassNames={{ inputWrapper: "!bg-default-100" }}
                      label={
                        <span className="font-medium text-base px-0.5">
                          End date
                        </span>
                      }
                      labelPlacement="outside"
                      variant="faded"
                      value={endDate}
                      onChange={setEndDate}
                      isInvalid={!isEndDateValid}
                      errorMessage="End date is before Start date"
                    />
                  </I18nProvider>
                </div>
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

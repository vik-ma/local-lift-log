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
} from "@heroui/react";
import { CaloricIntakeDropdown } from "../Dropdowns/CaloricIntakeDropdown";

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
                  className="h-[4.5rem]"
                  value={timePeriod.name}
                  isInvalid={!isTimePeriodNameValid}
                  label="Name"
                  errorMessage={!isTimePeriodNameValid && "Name can't be empty"}
                  variant="faded"
                  size="sm"
                  onValueChange={(value) =>
                    setTimePeriod((prev) => ({ ...prev, name: value }))
                  }
                  isRequired
                  isClearable
                />
                <div className="flex relative gap-4 justify-between pb-1.5">
                  <I18nProvider locale={userSettings.locale}>
                    <DatePicker
                      classNames={{ base: "gap-0.5" }}
                      dateInputClassNames={{ inputWrapper: "!bg-default-100" }}
                      label={
                        <span className="font-medium text-base px-0.5">
                          Start Date
                        </span>
                      }
                      labelPlacement="outside"
                      variant="faded"
                      value={startDate}
                      onChange={setStartDate}
                      isInvalid={!isStartDateValid}
                      errorMessage="Start Date must be selected"
                    />
                  </I18nProvider>
                  <I18nProvider locale={userSettings.locale}>
                    <DatePicker
                      classNames={{ base: "gap-0.5" }}
                      dateInputClassNames={{ inputWrapper: "!bg-default-100" }}
                      label={
                        <span className="font-medium text-base px-0.5">
                          End Date
                        </span>
                      }
                      labelPlacement="outside"
                      variant="faded"
                      value={endDate}
                      onChange={setEndDate}
                      isInvalid={!isEndDateValid}
                      errorMessage="End Date is before Start Date"
                    />
                  </I18nProvider>
                  {endDate !== null && (
                    <Button
                      aria-label="Reset End Date"
                      className="absolute right-0 -top-2.5"
                      size="sm"
                      variant="flat"
                      onPress={() => setEndDate(null)}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <h3 className="font-medium px-0.5 pb-1">
                  Additional Information
                </h3>
                <div className="flex flex-col gap-2.5">
                  <Input
                    value={timePeriod.note ?? ""}
                    label="Note"
                    variant="faded"
                    size="sm"
                    onValueChange={(value) =>
                      setTimePeriod((prev) => ({ ...prev, note: value }))
                    }
                    isClearable
                  />
                  <CaloricIntakeDropdown
                    value={timePeriod.caloric_intake}
                    targetType="time-period"
                    setTimePeriod={setTimePeriod}
                  />
                  <Input
                    value={timePeriod.injury ?? ""}
                    label="Injury"
                    variant="faded"
                    size="sm"
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

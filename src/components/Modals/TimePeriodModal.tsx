import { I18nProvider } from "@react-aria/i18n";
import {
  TimePeriod,
  UseDisclosureReturnType,
  UserSettings,
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
  DateValue,
} from "@heroui/react";
import { DietPhaseDropdown } from "..";
import { useEffect, useMemo, useState } from "react";
import { useIsDateBeforeEpochDate, useValidateName } from "../../hooks";
import {
  ConvertDateStringToCalendarDate,
  ConvertEmptyStringToNull,
  ConvertISODateStringToCalendarDate,
  FormatISODateString,
  GetNumberOfDaysBetweenDates,
  IsDateBeforeEpochDate,
  IsDatePassed,
  IsEndDateBeforeStartDate,
} from "../../helpers";
import { getLocalTimeZone, CalendarDate } from "@internationalized/date";

type TimePeriodModalProps = {
  timePeriodModal: UseDisclosureReturnType;
  timePeriod: TimePeriod;
  setTimePeriod: React.Dispatch<React.SetStateAction<TimePeriod>>;
  userSettings: UserSettings;
  buttonAction: (timePeriod: TimePeriod) => void;
};

export const TimePeriodModal = ({
  timePeriodModal,
  timePeriod,
  setTimePeriod,
  userSettings,
  buttonAction,
}: TimePeriodModalProps) => {
  const [nameInput, setNameInput] = useState<string>("");
  const [noteInput, setNoteInput] = useState<string>("");
  const [injuryInput, setInjuryInput] = useState<string>("");
  const [startDate, setStartDate] = useState<CalendarDate | null>(
    ConvertDateStringToCalendarDate(timePeriod.start_date)
  );
  const [endDate, setEndDate] = useState<CalendarDate | null>(
    ConvertDateStringToCalendarDate(timePeriod.end_date)
  );

  const isNameValid = useValidateName(nameInput);

  const isStartDateBeforeEpoch = useIsDateBeforeEpochDate(startDate);
  const isEndDateBeforeEpoch = useIsDateBeforeEpochDate(endDate);

  const isStartDateValid = useMemo(() => {
    if (startDate === null) return false;
    if (isStartDateBeforeEpoch) return false;
    return true;
  }, [startDate, isStartDateBeforeEpoch]);

  const isEndDateValid = useMemo(() => {
    if (startDate === null || endDate === null) return true;

    if (isEndDateBeforeEpoch) return false;

    return !IsEndDateBeforeStartDate(startDate, endDate);
  }, [startDate, endDate, isEndDateBeforeEpoch]);

  const isTimePeriodValid = useMemo(() => {
    if (!isNameValid) return false;
    if (!isStartDateValid) return false;
    if (!isEndDateValid) return false;
    return true;
  }, [isNameValid, isStartDateValid, isEndDateValid]);

  const startDateString: string | null = useMemo(() => {
    if (startDate === null) return null;

    const startDateDate = startDate.toDate(getLocalTimeZone());

    return startDateDate.toISOString();
  }, [startDate]);

  const endDateString: string | null = useMemo(() => {
    if (endDate === null) return null;

    const endDateDate = endDate.toDate(getLocalTimeZone());
    endDateDate.setHours(23, 59, 59, 999);

    return endDateDate.toISOString();
  }, [endDate]);

  useEffect(() => {
    setNameInput(timePeriod.name);
    setNoteInput(timePeriod.note ?? "");
    setInjuryInput(timePeriod.injury ?? "");
    setStartDate(ConvertISODateStringToCalendarDate(timePeriod.start_date));
    setEndDate(ConvertISODateStringToCalendarDate(timePeriod.end_date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriod.id]);

  const isDateUnavailable = (date: DateValue) => {
    return IsDateBeforeEpochDate(date as CalendarDate);
  };

  const handleSaveButton = () => {
    if (!isTimePeriodValid) return;

    const note = ConvertEmptyStringToNull(noteInput);
    const injury = ConvertEmptyStringToNull(injuryInput);

    const formattedStartDate = FormatISODateString(
      startDateString,
      userSettings.locale
    );
    const formattedEndDate = FormatISODateString(
      endDateString,
      userSettings.locale
    );

    const isOngoing = endDateString === null || !IsDatePassed(endDateString);

    const numDaysBetweenDates = GetNumberOfDaysBetweenDates(
      timePeriod.start_date,
      timePeriod.end_date
    );

    const updatedTimePeriod: TimePeriod = {
      ...timePeriod,
      start_date: startDateString,
      end_date: endDateString,
      name: nameInput,
      note: note,
      injury: injury,
      formattedStartDate,
      formattedEndDate,
      isOngoing,
      numDaysBetweenDates: numDaysBetweenDates,
    };

    buttonAction(updatedTimePeriod);
  };

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
                  value={nameInput}
                  isInvalid={!isNameValid}
                  label="Name"
                  errorMessage={!isNameValid && "Name can't be empty"}
                  variant="faded"
                  size="sm"
                  onValueChange={setNameInput}
                  isRequired
                  isClearable
                />
                <div className="flex relative gap-4 justify-between pb-1.5">
                  <I18nProvider locale={userSettings.locale}>
                    <DatePicker
                      classNames={{
                        base: "gap-0.5",
                        inputWrapper: "!bg-default-100",
                        label: "text-neutral-700",
                        helperWrapper: "px-0.5",
                        segment: "data-[invalid=true]:focus:bg-danger-600/15",
                      }}
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
                      errorMessage={
                        isStartDateBeforeEpoch
                          ? "Invalid Date"
                          : "Start Date must be selected"
                      }
                      isDateUnavailable={isDateUnavailable}
                    />
                  </I18nProvider>
                  <I18nProvider locale={userSettings.locale}>
                    <DatePicker
                      classNames={{
                        base: "gap-0.5",
                        inputWrapper: "!bg-default-100",
                        label: "text-neutral-700",
                        helperWrapper: "px-0.5",
                        segment: "data-[invalid=true]:focus:bg-danger-600/15",
                      }}
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
                      errorMessage={
                        isEndDateBeforeEpoch
                          ? "Invalid Date"
                          : "End Date is before Start Date"
                      }
                      isDateUnavailable={isDateUnavailable}
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
                  Optional Information
                </h3>
                <div className="flex flex-col gap-2">
                  <Input
                    value={noteInput}
                    label="Note"
                    variant="faded"
                    size="sm"
                    onValueChange={setNoteInput}
                    isClearable
                  />
                  <Input
                    value={injuryInput}
                    label="Injury"
                    variant="faded"
                    size="sm"
                    onValueChange={setInjuryInput}
                    isClearable
                  />
                  <DietPhaseDropdown
                    value={timePeriod.diet_phase}
                    targetType="time-period"
                    setTimePeriod={setTimePeriod}
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
                onPress={handleSaveButton}
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

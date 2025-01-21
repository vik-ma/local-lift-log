import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  DatePicker,
  CalendarDate,
  DateValue,
  DateRangePicker,
  RangeValue,
} from "@nextui-org/react";
import {
  DietLog,
  DietLogMap,
  UseDietLogEntryInputsReturnType,
  UseDisclosureReturnType,
  UserSettings,
} from "../../typings";
import { DietLogDayDropdown } from "../Dropdowns/DietLogDayDropdown";
import { useEffect, useMemo, useState } from "react";
import { I18nProvider } from "@react-aria/i18n";
import { ConvertCalendarDateToYmdString } from "../../helpers";
// import { getLocalTimeZone, today } from "@internationalized/date";

type DietLogModalProps = {
  dietLogModal: UseDisclosureReturnType;
  dietLog: DietLog;
  useDietLogEntryInputs: UseDietLogEntryInputsReturnType;
  dietLogMap: DietLogMap;
  userSettings: UserSettings;
  isEditing: boolean;
  doneButtonAction: (date: string) => void;
  saveRangeButtonAction: (dateRange: RangeValue<CalendarDate>) => void;
};

export const DietLogModal = ({
  dietLogModal,
  dietLog,
  useDietLogEntryInputs,
  dietLogMap,
  userSettings,
  isEditing,
  doneButtonAction,
  saveRangeButtonAction,
}: DietLogModalProps) => {
  const [dateRange, setDateRange] = useState<RangeValue<CalendarDate> | null>(
    null
  );

  const {
    caloriesInput,
    setCaloriesInput,
    fatInput,
    setFatInput,
    carbsInput,
    setCarbsInput,
    proteinInput,
    setProteinInput,
    commentInput,
    setCommentInput,
    isCaloriesInputValid,
    isCarbsInputValid,
    isFatInputValid,
    isProteinInputValid,
    isDietLogEntryInputValid,
    targetDay,
    setTargetDay,
    calculateCaloriesFromMacros,
    dateEntryType,
    setDateEntryType,
    dateStringToday,
    dateStringYesterday,
    dateStringSelectedDate,
    selectedDate,
    setSelectedDate,
  } = useDietLogEntryInputs;

  const copyLastValues = () => {
    if (dietLog.id === 0) return;

    setCaloriesInput(dietLog.calories.toString());

    if (dietLog.fat !== null) {
      setFatInput(dietLog.fat.toString());
    }
    if (dietLog.carbs !== null) {
      setCarbsInput(dietLog.carbs.toString());
    }
    if (dietLog.protein !== null) {
      setProteinInput(dietLog.protein.toString());
    }
  };

  const disabledDropdownKeys = useMemo(() => {
    const disabledKeys: string[] = [];

    if (dietLogMap.has(dateStringToday)) {
      disabledKeys.push("Today");
    }

    if (dietLogMap.has(dateStringYesterday)) {
      disabledKeys.push("Yesterday");
    }

    return disabledKeys;
  }, [dietLogMap, dateStringToday, dateStringYesterday]);

  const disableTodayOrYesterdayEntry = useMemo(() => {
    return (
      dietLogMap.has(dateStringToday) && dietLogMap.has(dateStringYesterday)
    );
  }, [dietLogMap, dateStringToday, dateStringYesterday]);

  useEffect(() => {
    if (dateEntryType === "custom" || dateEntryType === "range") return;

    if (disableTodayOrYesterdayEntry) {
      setDateEntryType("custom");
    }

    if (targetDay === "Yesterday" && dietLogMap.has(dateStringYesterday)) {
      setTargetDay("Today");
    }

    if (targetDay === "Today" && dietLogMap.has(dateStringToday)) {
      setTargetDay("Yesterday");
    }
  }, [
    dietLogMap,
    targetDay,
    setTargetDay,
    dateStringToday,
    dateStringYesterday,
    disableTodayOrYesterdayEntry,
    dateEntryType,
    setDateEntryType,
  ]);

  const disableSaveButton = useMemo(() => {
    if (!isDietLogEntryInputValid) return true;

    if (
      dateEntryType === "recent" &&
      targetDay === "Today" &&
      dietLogMap.has(dateStringToday)
    )
      return true;

    if (
      dateEntryType === "recent" &&
      targetDay === "Yesterday" &&
      dietLogMap.has(dateStringYesterday)
    )
      return true;

    if (
      dateEntryType === "custom" &&
      !isEditing &&
      (dateStringSelectedDate === null ||
        dietLogMap.has(dateStringSelectedDate))
    )
      return true;

    return false;
  }, [
    isDietLogEntryInputValid,
    targetDay,
    dietLogMap,
    dateStringToday,
    dateStringYesterday,
    dateStringSelectedDate,
    dateEntryType,
    isEditing,
  ]);

  // const currentCalendarDate = useMemo(() => today(getLocalTimeZone()), []);

  const isDateUnavailable = (date: DateValue) => {
    // Disable dates before current date
    // if (date.compare(currentCalendarDate) > 0) return true;

    const dateString = ConvertCalendarDateToYmdString(date as CalendarDate);

    if (dateString === null) return false;

    if (
      isEditing &&
      dietLogMap.has(dateString) &&
      dietLogMap.get(dateString)!.id === dietLog.id
    )
      return false;

    return dietLogMap.has(dateString);
  };

  const handleSaveButton = () => {
    if (disableSaveButton) return;

    if (dateEntryType === "range") {
      handleSaveRange();
      return;
    }

    const date =
      dateEntryType === "custom"
        ? dateStringSelectedDate
        : targetDay === "Yesterday"
        ? dateStringYesterday
        : dateStringToday;

    if (date === null) return;

    doneButtonAction(date);
  };

  const handleSaveRange = () => {
    // TODO: ADD
  };

  return (
    <Modal
      isOpen={dietLogModal.isOpen}
      onOpenChange={dietLogModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {dietLog.id === 0 ? "New" : "Edit"} Diet Log Entry
            </ModalHeader>
            <ModalBody>
              <div className="flex gap-6">
                <div className="flex flex-col gap-2 pt-[0.25rem] w-[12.5rem]">
                  <div className="flex flex-col gap-1.5">
                    <Input
                      value={caloriesInput}
                      label="Calories"
                      radius="lg"
                      size="sm"
                      variant="faded"
                      onValueChange={(value) => setCaloriesInput(value)}
                      isInvalid={!isCaloriesInputValid}
                      isRequired
                      isClearable
                    />
                    <Input
                      value={commentInput}
                      label="Comment"
                      radius="lg"
                      size="sm"
                      variant="faded"
                      onValueChange={(value) => setCommentInput(value)}
                      isClearable
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-medium px-0.5">
                      Macros
                      <span className="text-xs font-normal text-default-500">
                        {" "}
                        (grams)
                      </span>
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      <Input
                        value={fatInput}
                        label="Fat"
                        radius="lg"
                        size="sm"
                        variant="faded"
                        onValueChange={(value) => setFatInput(value)}
                        isInvalid={!isFatInputValid}
                        isClearable
                      />
                      <Input
                        value={carbsInput}
                        label="Carbohydrates"
                        radius="lg"
                        size="sm"
                        variant="faded"
                        onValueChange={(value) => setCarbsInput(value)}
                        isInvalid={!isCarbsInputValid}
                        isClearable
                      />
                      <Input
                        value={proteinInput}
                        label="Protein"
                        radius="lg"
                        size="sm"
                        variant="faded"
                        onValueChange={(value) => setProteinInput(value)}
                        isInvalid={!isProteinInputValid}
                        isClearable
                      />
                      <Button
                        className="mt-0.5"
                        color="secondary"
                        variant="flat"
                        size="sm"
                        onPress={calculateCaloriesFromMacros}
                      >
                        Calculate Calories From Macros
                      </Button>
                    </div>
                  </div>
                </div>
                {dateEntryType === "recent" ? (
                  <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-medium px-0.5">Diet Entry For Day</h3>
                      <DietLogDayDropdown
                        value={targetDay}
                        setState={setTargetDay}
                        targetType="state"
                        userSettings={userSettings}
                        disabledKeys={disabledDropdownKeys}
                      />
                    </div>
                    {dietLog.id !== 0 && !isEditing && (
                      <div className="flex flex-col gap-0.5">
                        <h3 className="font-medium text-lg px-0.5 border-b-1 text-stone-600">
                          Last Diet Log
                        </h3>
                        <div className="flex flex-col px-0.5 break-words w-[11rem] text-sm">
                          <span className="text-sm font-medium text-secondary">
                            {dietLog.formattedDate}
                          </span>
                          <div className="text-base truncate">
                            <span className="font-semibold text-slate-500">
                              {dietLog.calories}{" "}
                            </span>
                            <span className="font-medium text-stone-600">
                              kcal
                            </span>
                          </div>
                          {dietLog.fat !== null && (
                            <div className="truncate">
                              <span className="font-semibold text-stone-600">
                                Fat:{" "}
                              </span>
                              <span className="font-medium text-slate-500">
                                {dietLog.fat} g
                              </span>
                            </div>
                          )}
                          {dietLog.carbs !== null && (
                            <div className="truncate">
                              <span className="font-semibold text-stone-600">
                                Carbs:{" "}
                              </span>
                              <span className="font-medium text-slate-500">
                                {dietLog.carbs} g
                              </span>
                            </div>
                          )}
                          {dietLog.protein !== null && (
                            <div className="truncate">
                              <span className="font-semibold text-stone-600">
                                Protein:{" "}
                              </span>
                              <span className="font-medium text-slate-500">
                                {dietLog.protein} g
                              </span>
                            </div>
                          )}
                          {dietLog.comment !== null && (
                            <div className="text-stone-500 max-h-[5rem] overflow-hidden">
                              <span className="font-medium">Comment: </span>
                              {dietLog.comment}
                            </div>
                          )}
                        </div>
                        <Button
                          className="mt-0.5"
                          color="secondary"
                          variant="flat"
                          size="sm"
                          onPress={copyLastValues}
                        >
                          Copy Last Diet Log Values
                        </Button>
                      </div>
                    )}
                  </div>
                ) : dateEntryType === "custom" ? (
                  <div className="flex flex-col">
                    <I18nProvider locale={userSettings.locale}>
                      <DatePicker
                        classNames={{ base: "gap-0.5" }}
                        dateInputClassNames={{
                          inputWrapper: "!bg-default-100",
                        }}
                        label={
                          <span className="text-base font-medium px-0.5">
                            Diet Entry For Day
                          </span>
                        }
                        labelPlacement="outside"
                        variant="faded"
                        value={selectedDate}
                        onChange={setSelectedDate}
                        isDateUnavailable={isDateUnavailable}
                      />
                    </I18nProvider>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <I18nProvider locale={userSettings.locale}>
                      <DateRangePicker
                        classNames={{
                          base: "gap-0.5",
                        }}
                        label={
                          <span className="text-base font-medium px-0.5">
                            Diet Entry For Day
                          </span>
                        }
                        labelPlacement="outside"
                        variant="faded"
                        value={dateRange}
                        onChange={setDateRange}
                        isDateUnavailable={isDateUnavailable}
                      />
                    </I18nProvider>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {!disableTodayOrYesterdayEntry && !isEditing && (
                  <Button
                    className="w-[12.5rem]"
                    variant="flat"
                    onPress={() =>
                      setDateEntryType(
                        dateEntryType === "custom" ? "recent" : "custom"
                      )
                    }
                  >
                    {dateEntryType === "custom"
                      ? "Cancel Custom Date Entry"
                      : "Add Custom Date Entry"}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={handleSaveButton}
                  isDisabled={disableSaveButton}
                >
                  {isEditing ? "Update" : "Save"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

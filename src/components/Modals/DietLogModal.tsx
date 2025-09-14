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
  RadioGroup,
  Radio,
} from "@heroui/react";
import {
  DietLog,
  DietLogDateEntryType,
  DietLogMap,
  UseDisclosureReturnType,
  UserSettings,
} from "../../typings";
import { DietLogDayDropdown, DateRange } from "..";
import { useEffect, useMemo, useState } from "react";
import { I18nProvider } from "@react-aria/i18n";
import {
  ConvertCalendarDateToYmdString,
  ConvertDateToYmdString,
  ConvertEmptyStringToNull,
  ConvertInputStringToNumber,
  ConvertInputStringToNumberOrNull,
  ConvertNullToEmptyInputString,
  ConvertNumberToInputString,
  ConvertYmdDateStringToCalendarDate,
  FormatYmdDateString,
  GetCurrentYmdDateString,
  GetYesterdayYmdDateString,
  IsStringEmpty,
  IsStringInvalidInteger,
  ShouldDietLogDisableExpansion,
} from "../../helpers";
import { getLocalTimeZone } from "@internationalized/date";
import { useDateRange } from "../../hooks";

type DietLogModalProps = {
  dietLogModal: UseDisclosureReturnType;
  dietLog: DietLog;
  dateEntryType: DietLogDateEntryType;
  setDateEntryType: React.Dispatch<React.SetStateAction<DietLogDateEntryType>>;
  dietLogMap: DietLogMap;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  isEditing: boolean;
  doneButtonAction: (dietLog: DietLog) => void;
  saveRangeButtonAction: (
    startDate: Date,
    endDate: Date,
    overwriteExistingDietLogs: boolean,
    dietLog: DietLog
  ) => void;
};

const MIN_VALUE_CALORIES = 0;
const DO_NOT_ALLOW_MIN_VALUE_CALORIES = true;

export const DietLogModal = ({
  dietLogModal,
  dietLog,
  dateEntryType,
  setDateEntryType,
  dietLogMap,
  userSettings,
  setUserSettings,
  isEditing,
  doneButtonAction,
  saveRangeButtonAction,
}: DietLogModalProps) => {
  const [caloriesInput, setCaloriesInput] = useState<string>("");
  const [fatInput, setFatInput] = useState<string>("");
  const [carbsInput, setCarbsInput] = useState<string>("");
  const [proteinInput, setProteinInput] = useState<string>("");
  const [commentInput, setCommentInput] = useState<string>("");
  const [dateRangeSaveType, setDateRangeSaveType] = useState<string>("pass");

  const [targetDay, setTargetDay] = useState<string>("Today");
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);

  const dateRange = useDateRange();

  const dateStringToday = useMemo(() => GetCurrentYmdDateString(), []);
  const dateStringYesterday = useMemo(() => GetYesterdayYmdDateString(), []);
  const dateStringSelectedDate = useMemo(
    () => ConvertCalendarDateToYmdString(selectedDate),
    [selectedDate]
  );

  const isCaloriesInputValid = useMemo(() => {
    if (IsStringEmpty(caloriesInput)) return false;
    if (
      IsStringInvalidInteger(
        caloriesInput,
        MIN_VALUE_CALORIES,
        DO_NOT_ALLOW_MIN_VALUE_CALORIES
      )
    )
      return false;
    return true;
  }, [caloriesInput]);

  const isFatInputValid = useMemo(() => {
    if (IsStringEmpty(fatInput)) return true;
    if (IsStringInvalidInteger(fatInput)) return false;
    return true;
  }, [fatInput]);

  const isCarbsInputValid = useMemo(() => {
    if (IsStringEmpty(carbsInput)) return true;
    if (IsStringInvalidInteger(carbsInput)) return false;
    return true;
  }, [carbsInput]);

  const isProteinInputValid = useMemo(() => {
    if (IsStringEmpty(proteinInput)) return true;
    if (IsStringInvalidInteger(proteinInput)) return false;
    return true;
  }, [proteinInput]);

  const isDietLogEntryInputValid = useMemo(() => {
    if (!isCaloriesInputValid) return false;
    if (!isFatInputValid) return false;
    if (!isCarbsInputValid) return false;
    if (!isProteinInputValid) return false;
    return true;
  }, [
    isCaloriesInputValid,
    isFatInputValid,
    isCarbsInputValid,
    isProteinInputValid,
  ]);

  const calculateCaloriesFromMacros = () => {
    const fatCalories = !isFatInputValid ? 0 : Number(fatInput) * 9;
    const carbsCalories = !isCarbsInputValid ? 0 : Number(carbsInput) * 4;
    const proteinCalories = !isProteinInputValid ? 0 : Number(proteinInput) * 4;

    const totalCalories = Math.round(
      fatCalories + carbsCalories + proteinCalories
    );

    setCaloriesInput(totalCalories.toString());
  };

  const { startDate, endDate, isEndDateBeforeStartDate, isDateRangeInvalid } =
    dateRange;

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

    if (dateEntryType === "range" && isDateRangeInvalid) return true;

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
    isDateRangeInvalid,
  ]);

  const isDateUnavailable = (date: DateValue) => {
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

    const calories = ConvertInputStringToNumber(caloriesInput);
    const comment = ConvertEmptyStringToNull(commentInput);
    const fat = ConvertInputStringToNumberOrNull(fatInput);
    const carbs = ConvertInputStringToNumberOrNull(carbsInput);
    const protein = ConvertInputStringToNumberOrNull(proteinInput);

    const disableExpansion = ShouldDietLogDisableExpansion(fat, carbs, protein);

    const updatedDietLog: DietLog = {
      ...dietLog,
      calories,
      fat,
      carbs,
      protein,
      comment,
      isExpanded: !disableExpansion,
      disableExpansion,
    };

    if (dateEntryType === "range") {
      handleSaveRange(updatedDietLog);
      return;
    }

    const date =
      dateEntryType === "custom"
        ? dateStringSelectedDate
        : targetDay === "Yesterday"
        ? dateStringYesterday
        : dateStringToday;

    if (date === null) return;

    const formattedDate = FormatYmdDateString(date);

    updatedDietLog.date = date;
    updatedDietLog.formattedDate = formattedDate;

    doneButtonAction(updatedDietLog);
    resetInputs();
  };

  const handleSaveRange = (dietLogTemplate: DietLog) => {
    if (
      dietLogTemplate.id !== 0 ||
      startDate === null ||
      endDate === null ||
      isEndDateBeforeStartDate
    )
      return;

    const startDateDate = startDate.toDate(getLocalTimeZone());
    const endDateDate = endDate.toDate(getLocalTimeZone());

    const overwriteExistingDietLogs = dateRangeSaveType === "overwrite";

    saveRangeButtonAction(
      startDateDate,
      endDateDate,
      overwriteExistingDietLogs,
      dietLogTemplate
    );

    dateRange.setStartDate(null);
    dateRange.setEndDate(null);
    resetInputs();
  };

  const showOverwriteOptions = useMemo(() => {
    if (startDate === null || endDate === null || isEndDateBeforeStartDate)
      return false;

    const endDateDate = endDate.toDate(getLocalTimeZone());

    const date = startDate.toDate(getLocalTimeZone());

    while (date <= endDateDate) {
      const dateString = ConvertDateToYmdString(date);
      if (dietLogMap.has(dateString)) {
        return true;
      }
      date.setDate(date.getDate() + 1);
    }

    return false;
  }, [startDate, endDate, isEndDateBeforeStartDate, dietLogMap]);

  const resetInputs = () => {
    setCaloriesInput("");
    setFatInput("");
    setCarbsInput("");
    setProteinInput("");
    setCommentInput("");
    setSelectedDate(null);
  };

  useEffect(() => {
    if (dateEntryType === "custom" || dateEntryType === "range") return;

    if (disableTodayOrYesterdayEntry) {
      setDateEntryType("custom");
    }

    if (
      userSettings.default_diet_log_day_is_yesterday &&
      !dietLogMap.has(dateStringYesterday)
    ) {
      setTargetDay("Yesterday");
      return;
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
    dateStringToday,
    dateStringYesterday,
    disableTodayOrYesterdayEntry,
    dateEntryType,
    setDateEntryType,
    userSettings,
  ]);

  useEffect(() => {
    setCaloriesInput(ConvertNumberToInputString(dietLog.calories));
    setFatInput(ConvertNumberToInputString(dietLog.fat));
    setCarbsInput(ConvertNumberToInputString(dietLog.carbs));
    setProteinInput(ConvertNumberToInputString(dietLog.protein));
    setCommentInput(ConvertNullToEmptyInputString(dietLog.comment));
    setSelectedDate(ConvertYmdDateStringToCalendarDate(dietLog.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dietLog.id]);

  return (
    <Modal
      isOpen={dietLogModal.isOpen}
      onOpenChange={dietLogModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {dateEntryType === "range"
                ? "Add Diet Log Entry For Date Range"
                : isEditing
                ? "Edit Diet Log Entry"
                : "New Diet Log Entry"}
            </ModalHeader>
            <ModalBody className="py-0">
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
                        setUserSettings={setUserSettings}
                        disabledKeys={disabledDropdownKeys}
                      />
                    </div>
                    {dietLog.id !== 0 && !isEditing && (
                      <div className="flex flex-col gap-px">
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
                        classNames={{
                          base: "gap-0.5",
                          inputWrapper: "!bg-default-100",
                          label: "text-neutral-700",
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
                        isInvalid={selectedDate === null}
                        isRequired
                      />
                    </I18nProvider>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between">
                    <DateRange
                      dateRange={dateRange}
                      locale={userSettings.locale}
                      isVertical
                    />
                    {showOverwriteOptions && (
                      <div className="flex flex-col gap-2.5">
                        <span className="text-xs font-medium text-yellow-600">
                          Diet Log entries already exist for one or more dates
                          within the selected date range.
                          <br />
                          <br />
                          Overwrite existing Diet Log entries for those dates?
                        </span>
                        <RadioGroup
                          color="secondary"
                          value={dateRangeSaveType}
                          onValueChange={(value) => setDateRangeSaveType(value)}
                        >
                          <Radio value="pass">Don't Overwrite</Radio>
                          <Radio value="overwrite">Overwrite</Radio>
                        </RadioGroup>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {!disableTodayOrYesterdayEntry &&
                  !isEditing &&
                  dateEntryType !== "range" && (
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

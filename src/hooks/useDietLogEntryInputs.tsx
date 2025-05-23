import { useMemo, useState } from "react";
import {
  ConvertCalendarDateToYmdString,
  ConvertYmdDateStringToCalendarDate,
  GetCurrentYmdDateString,
  GetYesterdayYmdDateString,
  IsStringEmpty,
  IsStringInvalidInteger,
} from "../helpers";
import {
  DietLog,
  DietLogDateEntryType,
  UseDietLogEntryInputsReturnType,
} from "../typings";
import { CalendarDate } from "@heroui/react";
import { useDateRange } from ".";

export const useDietLogEntryInputs = (
  defaultDateEntryType: DietLogDateEntryType
): UseDietLogEntryInputsReturnType => {
  const [caloriesInput, setCaloriesInput] = useState<string>("");
  const [fatInput, setFatInput] = useState<string>("");
  const [carbsInput, setCarbsInput] = useState<string>("");
  const [proteinInput, setProteinInput] = useState<string>("");
  const [commentInput, setCommentInput] = useState<string>("");
  const [targetDay, setTargetDay] = useState<string>("Today");
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
  const [dateEntryType, setDateEntryType] =
    useState<DietLogDateEntryType>(defaultDateEntryType);

  const dateRange = useDateRange();

  const dateStringToday = useMemo(() => GetCurrentYmdDateString(), []);
  const dateStringYesterday = useMemo(() => GetYesterdayYmdDateString(), []);
  const dateStringSelectedDate = useMemo(
    () => ConvertCalendarDateToYmdString(selectedDate),
    [selectedDate]
  );

  const isCaloriesInputValid = useMemo(() => {
    if (IsStringEmpty(caloriesInput)) return false;
    if (IsStringInvalidInteger(caloriesInput, 0, true)) return false;
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

  const resetDietLogInputs = () => {
    setCaloriesInput("");
    setSelectedDate(null);
    setFatInput("");
    setCarbsInput("");
    setProteinInput("");
    setCommentInput("");
    dateRange.setStartDate(null);
    dateRange.setEndDate(null);
  };

  const calculateCaloriesFromMacros = () => {
    const fatCalories = !isFatInputValid ? 0 : Number(fatInput) * 9;
    const carbsCalories = !isCarbsInputValid ? 0 : Number(carbsInput) * 4;
    const proteinCalories = !isProteinInputValid ? 0 : Number(proteinInput) * 4;

    const totalCalories = Math.round(
      fatCalories + carbsCalories + proteinCalories
    );

    setCaloriesInput(totalCalories.toString());
  };

  const loadDietLogInputs = (dietLog: DietLog) => {
    setCaloriesInput(dietLog.calories.toString());

    setSelectedDate(ConvertYmdDateStringToCalendarDate(dietLog.date));

    if (dietLog.fat !== null) setFatInput(dietLog.fat.toString());
    if (dietLog.carbs !== null) setCarbsInput(dietLog.carbs.toString());
    if (dietLog.protein !== null) setProteinInput(dietLog.protein.toString());

    if (dietLog.comment !== null) setCommentInput(dietLog.comment.toString());
  };

  return {
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
    resetDietLogInputs,
    calculateCaloriesFromMacros,
    selectedDate,
    setSelectedDate,
    loadDietLogInputs,
    dateEntryType,
    setDateEntryType,
    dateStringToday,
    dateStringYesterday,
    dateStringSelectedDate,
    dateRange,
  };
};

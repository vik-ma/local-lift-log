import { useMemo, useState } from "react";
import {
  IsStringEmpty,
  IsStringInvalidInteger,
  IsStringInvalidIntegerOr0,
} from "../helpers";
import { UseDietLogEntryInputsReturnType } from "../typings";

export const useDietLogEntryInputs = (): UseDietLogEntryInputsReturnType => {
  const [caloriesInput, setCaloriesInput] = useState<string>("");
  const [fatInput, setFatInput] = useState<string>("");
  const [carbsInput, setCarbsInput] = useState<string>("");
  const [proteinInput, setProteinInput] = useState<string>("");
  const [commentInput, setCommentInput] = useState<string>("");
  const [targetDay, setTargetDay] = useState<string>("Today");

  const isCaloriesInputValid = useMemo(() => {
    if (IsStringEmpty(caloriesInput)) return false;
    if (IsStringInvalidIntegerOr0(caloriesInput)) return false;
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

  const resetInputs = () => {
    setCaloriesInput("");
    setFatInput("");
    setCarbsInput("");
    setProteinInput("");
    setCommentInput("");
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
    resetInputs,
    calculateCaloriesFromMacros,
  };
};

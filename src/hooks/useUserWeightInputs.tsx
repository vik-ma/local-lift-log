import { useMemo, useState } from "react";
import { UserWeight, UseUserWeightInputsReturnType } from "../typings";
import { useIsStringValidNumberAbove0 } from ".";
import {
  IsNumberValidPercentage,
  IsStringEmpty,
  IsStringInvalidNumber,
} from "../helpers";

export const useUserWeightInputs = (): UseUserWeightInputsReturnType => {
  const [userWeightInput, setUserWeightInput] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("");
  const [commentInput, setCommentInput] = useState<string>("");
  const [bodyFatPercentageInput, setBodyFatPercentageInput] =
    useState<string>("");

  const isWeightInputValid = useIsStringValidNumberAbove0(userWeightInput);
  const isBodyFatPercentageInputValid = useMemo(() => {
    if (IsStringEmpty(bodyFatPercentageInput)) return true;
    if (IsStringInvalidNumber(bodyFatPercentageInput)) return false;
    if (!IsNumberValidPercentage(Number(bodyFatPercentageInput), false))
      return false;

    return true;
  }, [bodyFatPercentageInput]);

  const isUserWeightValid = useMemo(() => {
    if (!isWeightInputValid) return false;
    if (!isBodyFatPercentageInputValid) return false;
    return true;
  }, [isWeightInputValid, isBodyFatPercentageInputValid]);

  const resetUserWeightInput = () => {
    setUserWeightInput("");
    setCommentInput("");
    setBodyFatPercentageInput("");
  };

  const loadUserWeightInputs = (userWeight: UserWeight) => {
    setUserWeightInput(userWeight.weight.toString());
    setCommentInput(userWeight.comment ?? "");
    setBodyFatPercentageInput(
      userWeight.body_fat_percentage
        ? userWeight.body_fat_percentage.toString()
        : ""
    );
    setWeightUnit(userWeight.weight_unit);
  };

  return {
    userWeightInput,
    setUserWeightInput,
    weightUnit,
    setWeightUnit,
    commentInput,
    setCommentInput,
    bodyFatPercentageInput,
    setBodyFatPercentageInput,
    isWeightInputValid,
    isBodyFatPercentageInputValid,
    isUserWeightValid,
    resetUserWeightInput,
    loadUserWeightInputs,
  };
};

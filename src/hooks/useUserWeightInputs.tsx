import { useMemo, useState } from "react";
import { useIsStringValidNumber } from ".";
import { UseUserWeightInputsReturnType } from "../typings";

export const useUserWeightInputs = (): UseUserWeightInputsReturnType => {
  const [userWeightInput, setUserWeightInput] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("");
  const [weightCommentInput, setWeightCommentInput] = useState<string>("");
  const [bodyFatPercentageInput, setBodyFatPercentageInput] =
    useState<string>("");

  const isWeightInputValid = useIsStringValidNumber(userWeightInput);
  const isBodyFatPercentageInputValid = useIsStringValidNumber(
    bodyFatPercentageInput
  );

  const isUserWeightValid = useMemo(() => {
    if (!isWeightInputValid) return false;
    if (!isBodyFatPercentageInputValid) return false;
    return true;
  }, [isWeightInputValid, isBodyFatPercentageInputValid]);

  const resetUserWeightInput = () => {
    setUserWeightInput("");
    setWeightCommentInput("");
    setBodyFatPercentageInput("");
  };

  return {
    userWeightInput,
    setUserWeightInput,
    weightUnit,
    setWeightUnit,
    weightCommentInput,
    setWeightCommentInput,
    bodyFatPercentageInput,
    setBodyFatPercentageInput,
    isWeightInputValid,
    isBodyFatPercentageInputValid,
    isUserWeightValid,
    resetUserWeightInput,
  };
};

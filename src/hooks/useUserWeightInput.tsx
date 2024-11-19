import { useIsStringValidNumber } from ".";
import {
  ConvertNumberToTwoDecimals,
  ConvertEmptyStringToNull,
  GetCurrentDateTimeISOString,
  FormatDateTimeString,
  UpdateUserWeight,
  InsertUserWeightIntoDatabase,
} from "../helpers";
import {
  UserSettings,
  UserWeight,
  BodyMeasurementsOperationType,
  UseDisclosureReturnType,
} from "../typings";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const useUserWeightInput = (
  latestUserWeight: UserWeight,
  setLatestUserWeight: React.Dispatch<React.SetStateAction<UserWeight>>,
  userWeightModal: UseDisclosureReturnType,
  userSettings: UserSettings | undefined,
  setOperationType?: React.Dispatch<
    React.SetStateAction<BodyMeasurementsOperationType>
  >
) => {
  const [userWeightInput, setUserWeightInput] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("");
  const [weightCommentInput, setWeightCommentInput] = useState<string>("");

  const isWeightInputValid = useIsStringValidNumber(userWeightInput);

  const addUserWeight = async (): Promise<{
    success: boolean;
    weight: number;
    weight_unit: string;
  }> => {
    if (!isWeightInputValid || userSettings === undefined)
      return { success: false, weight: 0, weight_unit: "" };

    const newWeight = ConvertNumberToTwoDecimals(Number(userWeightInput));

    const commentToInsert = ConvertEmptyStringToNull(weightCommentInput);

    const currentDateString = GetCurrentDateTimeISOString();

    const userWeightId = await InsertUserWeightIntoDatabase(
      newWeight,
      weightUnit,
      currentDateString,
      commentToInsert
    );

    if (userWeightId === 0) {
      return { success: false, weight: 0, weight_unit: "" };
    }

    const formattedDate: string = FormatDateTimeString(
      currentDateString,
      userSettings.clock_style === "24h"
    );

    const newUserWeight: UserWeight = {
      id: userWeightId,
      weight: newWeight,
      weight_unit: weightUnit,
      date: currentDateString,
      formattedDate: formattedDate,
      comment: commentToInsert,
    };

    setLatestUserWeight(newUserWeight);

    resetWeightInput();

    userWeightModal.onClose();
    toast.success("Body Weight Entry Added");

    return { success: true, weight: newWeight, weight_unit: weightUnit };
  };

  const updateUserWeight = async () => {
    if (latestUserWeight.id === 0 || !isWeightInputValid) return;

    const newWeight = ConvertNumberToTwoDecimals(Number(userWeightInput));

    const commentToInsert = ConvertEmptyStringToNull(weightCommentInput);

    const updatedUserWeight: UserWeight = {
      ...latestUserWeight,
      weight: newWeight,
      comment: commentToInsert,
    };

    const success = await UpdateUserWeight(updatedUserWeight);

    if (!success) return;

    setLatestUserWeight(updatedUserWeight);

    resetWeightInput();

    userWeightModal.onClose();
    toast.success("Body Weight Entry Updated");
  };

  const resetWeightInput = () => {
    setUserWeightInput("");
    setWeightCommentInput("");

    if (setOperationType) {
      setOperationType("add");
    }
  };

  useEffect(() => {
    if (userSettings) {
      setWeightUnit(userSettings.default_unit_weight);
    }
  }, [userSettings]);

  return {
    addUserWeight,
    updateUserWeight,
    isWeightInputValid,
    userWeightInput,
    setUserWeightInput,
    weightUnit,
    setWeightUnit,
    weightCommentInput,
    setWeightCommentInput,
    resetWeightInput,
  };
};

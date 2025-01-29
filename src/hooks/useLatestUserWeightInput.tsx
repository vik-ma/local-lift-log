import { useUserWeightInputs } from ".";
import {
  ConvertNumberToTwoDecimals,
  ConvertEmptyStringToNull,
  GetCurrentDateTimeISOString,
  FormatDateTimeString,
  UpdateUserWeight,
  InsertUserWeightIntoDatabase,
  ConvertInputStringToNumberWithTwoDecimalsOrNull,
} from "../helpers";
import {
  UserSettings,
  UserWeight,
  BodyMeasurementsOperationType,
  UseDisclosureReturnType,
} from "../typings";
import { useEffect } from "react";
import toast from "react-hot-toast";

export const useLatestUserWeightInput = (
  latestUserWeight: UserWeight,
  setLatestUserWeight: React.Dispatch<React.SetStateAction<UserWeight>>,
  userWeightModal: UseDisclosureReturnType,
  userSettings: UserSettings | undefined,
  setOperationType?: React.Dispatch<
    React.SetStateAction<BodyMeasurementsOperationType>
  >
) => {
  const userWeightInputs = useUserWeightInputs();

  const {
    userWeightInput,
    weightUnit,
    setWeightUnit,
    commentInput,
    bodyFatPercentageInput,
    isUserWeightValid,
    resetUserWeightInput,
  } = userWeightInputs;

  const addUserWeight = async (): Promise<{
    success: boolean;
    weight: number;
    weight_unit: string;
  }> => {
    if (!isUserWeightValid || userSettings === undefined)
      return { success: false, weight: 0, weight_unit: "" };

    const newWeight = ConvertNumberToTwoDecimals(Number(userWeightInput));

    const commentToInsert = ConvertEmptyStringToNull(commentInput);

    const currentDateString = GetCurrentDateTimeISOString();

    const bodyFatPercentage = ConvertInputStringToNumberWithTwoDecimalsOrNull(
      bodyFatPercentageInput
    );

    const userWeightId = await InsertUserWeightIntoDatabase(
      newWeight,
      weightUnit,
      currentDateString,
      commentToInsert,
      bodyFatPercentage
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
      body_fat_percentage: bodyFatPercentage,
    };

    setLatestUserWeight(newUserWeight);

    resetLatestUserWeightInput();

    userWeightModal.onClose();
    toast.success("Body Weight Entry Added");

    return { success: true, weight: newWeight, weight_unit: weightUnit };
  };

  const updateUserWeight = async () => {
    if (latestUserWeight.id === 0 || !isUserWeightValid) return;

    const newWeight = ConvertNumberToTwoDecimals(Number(userWeightInput));

    const commentToInsert = ConvertEmptyStringToNull(commentInput);

    const bodyFatPercentage = ConvertInputStringToNumberWithTwoDecimalsOrNull(
      bodyFatPercentageInput
    );

    const updatedUserWeight: UserWeight = {
      ...latestUserWeight,
      weight: newWeight,
      comment: commentToInsert,
      body_fat_percentage: bodyFatPercentage,
    };

    const success = await UpdateUserWeight(updatedUserWeight);

    if (!success) return;

    setLatestUserWeight(updatedUserWeight);

    resetLatestUserWeightInput();

    userWeightModal.onClose();
    toast.success("Body Weight Entry Updated");
  };

  const resetLatestUserWeightInput = () => {
    resetUserWeightInput();

    if (setOperationType) {
      setOperationType("add");
    }
  };

  useEffect(() => {
    if (userSettings !== undefined) {
      setWeightUnit(userSettings.default_unit_weight);
    }
  }, []);

  return {
    addUserWeight,
    updateUserWeight,
    resetLatestUserWeightInput,
    userWeightInputs,
  };
};

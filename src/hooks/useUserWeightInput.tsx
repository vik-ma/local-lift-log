import { useIsStringValidNumber } from ".";
import {
  ConvertNumberToTwoDecimals,
  ConvertEmptyStringToNull,
  GetCurrentDateTimeISOString,
  FormatDateTimeString,
  UpdateUserWeight,
} from "../helpers";
import Database from "tauri-plugin-sql-api";
import { UserSettings, UserWeight } from "../typings";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDisclosure } from "@nextui-org/react";

export const useUserWeightInput = (
  latestUserWeight: UserWeight,
  setLatestUserWeight: React.Dispatch<React.SetStateAction<UserWeight>>,
  userWeightModal: ReturnType<typeof useDisclosure>,
  userSettings: UserSettings | undefined,
  resetWeightInput: () => void
) => {
  const [userWeightInput, setUserWeightInput] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("");
  const [weightCommentInput, setWeightCommentInput] = useState<string>("");

  const isWeightInputValid = useIsStringValidNumber(userWeightInput);

  const addUserWeight = async () => {
    if (!isWeightInputValid) return;

    const newWeight = ConvertNumberToTwoDecimals(Number(userWeightInput));

    const commentToInsert = ConvertEmptyStringToNull(weightCommentInput);

    const currentDateString = GetCurrentDateTimeISOString();

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(
        "INSERT into user_weights (weight, weight_unit, date, comment) VALUES ($1, $2, $3, $4)",
        [newWeight, weightUnit, currentDateString, commentToInsert]
      );

      const formattedDate: string = FormatDateTimeString(
        currentDateString,
        userSettings?.clock_style === "24h"
      );

      const newUserWeight: UserWeight = {
        id: result.lastInsertId,
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
    } catch (error) {
      console.log(error);
    }
  };

  const updateUserWeight = async () => {
    if (latestUserWeight.id === 0 || !isWeightInputValid) return;

    const newWeight = Number(userWeightInput);

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
  };
};

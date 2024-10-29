import Database from "tauri-plugin-sql-api";
import { useState, useEffect, useCallback } from "react";
import { UserWeight, UserSettingsOptional } from "../typings";
import {
  LoadingSpinner,
  DeleteModal,
  UserWeightModal,
  EmptyListLabel,
  UserWeightListItem,
} from "../components";
import {
  ConvertEmptyStringToNull,
  ConvertNumberToTwoDecimals,
  DeleteItemFromList,
  DeleteUserWeightWithId,
  FormatDateTimeString,
  UpdateItemInList,
  UpdateUserWeight,
} from "../helpers";
import { useDisclosure } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { useDefaultUserWeight, useIsStringValidNumber } from "../hooks";

type OperationType = "edit" | "delete";

export default function UserWeightList() {
  const [userWeights, setUserWeights] = useState<UserWeight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [operationType, setOperationType] = useState<OperationType>("edit");
  const [userWeightInput, setUserWeightInput] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("");
  const [commentInput, setCommentInput] = useState<string>("");

  const defaultUserWeight = useDefaultUserWeight();

  const [operatingUserWeight, setOperatingUserWeight] =
    useState<UserWeight>(defaultUserWeight);

  const deleteModal = useDisclosure();
  const userWeightModal = useDisclosure();

  const getUserWeights = useCallback(async (clockStyle: string) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<UserWeight[]>(
        "SELECT * FROM user_weights ORDER BY id DESC"
      );

      const userWeights: UserWeight[] = result.map((row) => {
        const formattedDate: string = FormatDateTimeString(
          row.date,
          clockStyle === "24h"
        );
        return {
          id: row.id,
          weight: row.weight,
          weight_unit: row.weight_unit,
          date: row.date,
          formattedDate: formattedDate,
          comment: row.comment,
        };
      });

      setUserWeights(userWeights);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<UserSettingsOptional[]>(
          "SELECT id, default_unit_weight, clock_style FROM user_settings"
        );

        const userSettings: UserSettingsOptional = result[0];

        if (userSettings !== undefined) {
          setOperatingUserWeight((prev) => ({
            ...prev,
            weight_unit: userSettings.default_unit_weight!,
          }));
          getUserWeights(userSettings.clock_style!);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadUserSettings();
  }, [getUserWeights]);

  const deleteUserWeight = async () => {
    if (operatingUserWeight.id === 0 || operationType !== "delete") return;

    const success = await DeleteUserWeightWithId(operatingUserWeight.id);

    if (!success) return;

    const updatedUserWeights = DeleteItemFromList(
      userWeights,
      operatingUserWeight.id
    );

    setUserWeights(updatedUserWeights);

    resetUserWeight();

    toast.success("Body Weight Entry Deleted");
    deleteModal.onClose();
  };

  const isWeightInputValid = useIsStringValidNumber(userWeightInput);

  const updateUserWeight = async () => {
    if (
      operatingUserWeight.id === 0 ||
      operationType !== "edit" ||
      !isWeightInputValid
    )
      return;

    const newWeight = ConvertNumberToTwoDecimals(Number(userWeightInput));

    const commentToInsert = ConvertEmptyStringToNull(commentInput);

    const updatedUserWeight: UserWeight = {
      ...operatingUserWeight,
      weight: newWeight,
      weight_unit: weightUnit,
      comment: commentToInsert,
    };

    const success = await UpdateUserWeight(updatedUserWeight);

    if (!success) return;

    const updatedUserWeights = UpdateItemInList(userWeights, updatedUserWeight);

    setUserWeights(updatedUserWeights);

    resetUserWeight();

    toast.success("Body Weight Entry Updated");
    userWeightModal.onClose();
  };

  const handleUserWeightOptionSelection = (
    key: string,
    userWeight: UserWeight
  ) => {
    if (key === "edit") {
      setOperatingUserWeight(userWeight);
      setUserWeightInput(userWeight.weight.toString());
      setWeightUnit(userWeight.weight_unit);
      setCommentInput(userWeight.comment ?? "");
      setOperationType("edit");
      userWeightModal.onOpen();
    } else if (key === "delete") {
      setOperatingUserWeight(userWeight);
      setOperationType("delete");
      deleteModal.onOpen();
    }
  };

  const resetUserWeight = () => {
    setOperatingUserWeight(defaultUserWeight);
    setOperationType("edit");
    setUserWeightInput("");
    setCommentInput("");
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Body Weight Entry"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete the Body Weight entry on{" "}
            <span className="text-secondary">
              {operatingUserWeight.formattedDate}
            </span>
            ?
          </p>
        }
        deleteButtonAction={deleteUserWeight}
      />
      <UserWeightModal
        userWeightModal={userWeightModal}
        userWeightInput={userWeightInput}
        setUserWeightInput={setUserWeightInput}
        isWeightInputValid={isWeightInputValid}
        weightUnit={weightUnit}
        setWeightUnit={setWeightUnit}
        commentInput={commentInput}
        setCommentInput={setCommentInput}
        buttonAction={updateUserWeight}
        isEditing={operationType === "edit"}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Weight List
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1 w-full">
              {userWeights.map((userWeight) => (
                <UserWeightListItem
                  userWeight={userWeight}
                  handleUserWeightOptionSelection={
                    handleUserWeightOptionSelection
                  }
                />
              ))}
              {userWeights.length === 0 && (
                <EmptyListLabel itemName="User Weight Entries" />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

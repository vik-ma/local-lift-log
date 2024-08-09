import Database from "tauri-plugin-sql-api";
import { useState, useEffect, useCallback } from "react";
import { UserWeight, UserSettingsOptional } from "../typings";
import { LoadingSpinner, DeleteModal, UserWeightModal } from "../components";
import {
  ConvertEmptyStringToNull,
  DeleteItemFromList,
  DeleteUserWeightWithId,
  FormatDateTimeString,
  UpdateItemInList,
  UpdateUserWeight,
} from "../helpers";
import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { VerticalMenuIcon } from "../assets";
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

    const newWeight = Number(userWeightInput);

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
            <span className="text-yellow-600">
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
                <div
                  className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                  key={userWeight.id}
                >
                  <div className="flex flex-col justify-start items-start">
                    <span className="w-[21.5rem] truncate text-left">
                      {userWeight.weight} {userWeight.weight_unit}
                    </span>
                    <span className="text-xs text-yellow-600 text-left">
                      {userWeight.formattedDate}
                    </span>
                    <span className="w-[21.5rem] break-all text-xs text-stone-400 text-left">
                      {userWeight.comment}
                    </span>
                  </div>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        aria-label={`Toggle ${userWeight.formattedDate} Weight Entry Options Menu`}
                        isIconOnly
                        className="z-1"
                        size="sm"
                        radius="lg"
                        variant="light"
                      >
                        <VerticalMenuIcon size={17} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label={`Option Menu For ${userWeight.id} Body Weight Entry`}
                      onAction={(key) =>
                        handleUserWeightOptionSelection(
                          key as string,
                          userWeight
                        )
                      }
                    >
                      <DropdownItem key="edit">Edit</DropdownItem>
                      <DropdownItem key="delete" className="text-danger">
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

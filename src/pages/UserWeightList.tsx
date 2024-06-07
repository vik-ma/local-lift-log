import Database from "tauri-plugin-sql-api";
import { useState, useEffect, useMemo, useCallback } from "react";
import { UserWeight, UserSettingsOptional } from "../typings";
import { LoadingSpinner, WeightUnitDropdown, DeleteModal } from "../components";
import {
  ConvertEmptyStringToNull,
  FormatDateTimeString,
  IsStringEmpty,
  IsStringInvalidNumber,
} from "../helpers";
import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { VerticalMenuIcon } from "../assets";

export default function UserWeightListPage() {
  const [userWeights, setUserWeights] = useState<UserWeight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userWeightToDelete, setUserWeightToDelete] = useState<UserWeight>();
  const [operatingUserWeight, setOperatingUserWeight] = useState<UserWeight>();
  const [newWeightInput, setNewWeightInput] = useState<string>("");
  const [newWeightUnit, setNewWeightUnit] = useState<string>("");
  const [newWeightCommentInput, setNewWeightCommentInput] =
    useState<string>("");

  const deleteModal = useDisclosure();
  const editWeightModal = useDisclosure();

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
          setNewWeightUnit(userSettings.default_unit_weight!);
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
    if (userWeightToDelete === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from user_weights WHERE id = $1", [
        userWeightToDelete.id,
      ]);

      const updatedUserWeights: UserWeight[] = userWeights.filter(
        (item) => item.id !== userWeightToDelete?.id
      );
      setUserWeights(updatedUserWeights);

      toast.success("Body Weight Record Deleted");
    } catch (error) {
      console.log(error);
    }

    setUserWeightToDelete(undefined);
    deleteModal.onClose();
  };

  const isWeightInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(newWeightInput);
  }, [newWeightInput]);

  const updateUserWeight = async () => {
    if (operatingUserWeight === undefined) return;

    if (isWeightInputInvalid || IsStringEmpty(newWeightInput)) return;

    const newWeight = Number(newWeightInput);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const commentToInsert = ConvertEmptyStringToNull(newWeightCommentInput);

      await db.execute(
        "UPDATE user_weights SET weight = $1, weight_unit = $2, comment = $3 WHERE id = $4",
        [newWeight, newWeightUnit, commentToInsert, operatingUserWeight.id]
      );

      const updatedUserWeight: UserWeight = {
        ...operatingUserWeight,
        weight: newWeight,
        weight_unit: newWeightUnit,
        comment: commentToInsert,
      };

      setUserWeights((prev) =>
        prev.map((item) =>
          item.id === operatingUserWeight.id ? updatedUserWeight : item
        )
      );

      setNewWeightInput("");
      setNewWeightCommentInput("");
      toast.success("Body Weight Updated");
      editWeightModal.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleUserWeightOptionSelection = (
    key: string,
    userWeight: UserWeight
  ) => {
    if (key === "edit") {
      setOperatingUserWeight(userWeight);
      setNewWeightInput(userWeight.weight.toString());
      setNewWeightCommentInput(userWeight.comment ?? "");
      editWeightModal.onOpen();
    } else if (key === "delete") {
      setUserWeightToDelete(userWeight);
      deleteModal.onOpen();
    }
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Body Weight Record"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete the Body Weight record
            on {userWeightToDelete?.formattedDate}?
          </p>
        }
        deleteButtonAction={deleteUserWeight}
      />
      <Modal
        isOpen={editWeightModal.isOpen}
        onOpenChange={editWeightModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Body Weight Record</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 font-medium">
                    <span className="text-amber-400">Old Value:</span>
                    <span>
                      {operatingUserWeight?.weight}
                      {operatingUserWeight?.weight_unit}
                    </span>
                    <span className="text-stone-400">
                      {operatingUserWeight?.formattedDate}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={newWeightInput}
                      label="Weight"
                      size="sm"
                      variant="faded"
                      onValueChange={(value) => setNewWeightInput(value)}
                      isInvalid={isWeightInputInvalid}
                      isClearable
                    />
                    <WeightUnitDropdown
                      value={newWeightUnit}
                      setState={setNewWeightUnit}
                      targetType="state"
                    />
                  </div>
                  <Input
                    value={newWeightCommentInput}
                    label="Comment"
                    size="sm"
                    variant="faded"
                    onValueChange={(value) => setNewWeightCommentInput(value)}
                    isClearable
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  onPress={updateUserWeight}
                  isDisabled={
                    isWeightInputInvalid || IsStringEmpty(newWeightInput)
                  }
                >
                  Update
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
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
                    <span className="w-[21.5rem] break-all text-xs text-stone-500 text-left">
                      {userWeight.comment}
                    </span>
                  </div>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
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
                      aria-label={`Option Menu For ${userWeight.id}`}
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

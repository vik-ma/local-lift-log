import Database from "tauri-plugin-sql-api";
import { useState, useEffect, useMemo } from "react";
import { UserWeight, UserSettingsOptional } from "../typings";
import { LoadingSpinner, WeightUnitDropdown } from "../components";
import {
  FormatDateTimeString,
  IsStringInvalidNumber,
  GetDefaultUnitValues,
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
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";

export default function UserWeightListPage() {
  const [userWeights, setUserWeights] = useState<UserWeight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userWeightToDelete, setUserWeightToDelete] = useState<UserWeight>();
  const [operatingUserWeight, setOperatingUserWeight] = useState<UserWeight>();
  const [newWeightInput, setNewWeightInput] = useState<string>("");
  const [newWeightUnit, setNewWeightUnit] = useState<string>("");

  const deleteModal = useDisclosure();
  const editWeightModal = useDisclosure();

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettingsOptional | undefined =
        await GetDefaultUnitValues();
      if (settings !== undefined)
        setNewWeightUnit(settings.default_unit_weight!);
    };

    const getUserWeights = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<UserWeight[]>(
          "SELECT * FROM user_weights"
        );

        const userWeights: UserWeight[] = result.map((row) => {
          const formattedDate: string = FormatDateTimeString(row.date);
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
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    loadUserSettings();
    getUserWeights();
  }, []);

  const handleDeleteButton = (userWeight: UserWeight) => {
    setUserWeightToDelete(userWeight);
    deleteModal.onOpen();
  };

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

  const handleEditButton = (userWeight: UserWeight) => {
    setOperatingUserWeight(userWeight);
    editWeightModal.onOpen();
  };

  const isWeightInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(newWeightInput);
  }, [newWeightInput]);

  const updateUserWeight = async () => {
    if (operatingUserWeight === undefined) return;

    if (isWeightInputInvalid || newWeightInput.trim().length === 0) return;

    const newWeight = Number(newWeightInput);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE user_weights SET weight = $1, weight_unit = $2 WHERE id = $3",
        [newWeight, newWeightUnit, operatingUserWeight.id]
      );

      const updatedUserWeight: UserWeight = {
        ...operatingUserWeight,
        weight: newWeight,
        weight_unit: newWeightUnit,
      };

      setUserWeights((prev) =>
        prev.map((item) =>
          item.id === operatingUserWeight.id ? updatedUserWeight : item
        )
      );

      setNewWeightInput("");
      toast.success("Body Weight Updated");
      editWeightModal.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Body Weight Record
              </ModalHeader>
              <ModalBody>
                <p className="break-all">
                  Are you sure you want to permanently delete the Body Weight
                  record on {userWeightToDelete?.formattedDate}?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={deleteUserWeight}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={editWeightModal.isOpen}
        onOpenChange={editWeightModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Body Weight Record
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
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
                  <div className="flex gap-2">
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
                    isWeightInputInvalid || newWeightInput.trim().length === 0
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
            <div className="flex flex-col gap-1">
              {userWeights.map((userWeight) => (
                <div
                  className="flex flex-col gap-1 font-medium items-center bg-white px-2.5 py-1.5 rounded-xl"
                  key={`${userWeight.id}`}
                >
                  <div className="flex justify-between gap-4 font-medium w-full">
                    <span>
                      {userWeight.weight}
                      {userWeight.weight_unit}
                    </span>
                    <span className="text-stone-400">
                      {userWeight.formattedDate}
                    </span>
                  </div>
                  <div className="flex justify-between gap-1 w-full items-end">
                    <div className="break-all">
                      <span className="text-stone-400">
                        {userWeight.comment}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        color="primary"
                        variant="flat"
                        size="sm"
                        onClick={() => handleEditButton(userWeight)}
                      >
                        Edit
                      </Button>
                      <Button
                        color="danger"
                        variant="flat"
                        size="sm"
                        onClick={() => handleDeleteButton(userWeight)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

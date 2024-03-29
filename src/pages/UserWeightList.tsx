import Database from "tauri-plugin-sql-api";
import { useState, useEffect } from "react";
import { UserWeight } from "../typings";
import { LoadingSpinner } from "../components";
import { FormatDateString } from "../helpers";
import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";

export default function UserWeightListPage() {
  const [userWeights, setUserWeights] = useState<UserWeight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userWeightToDelete, setUserWeightToDelete] = useState<UserWeight>();

  const deleteModal = useDisclosure();

  useEffect(() => {
    const getUserWeights = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<UserWeight[]>(
          "SELECT * FROM user_weights"
        );

        const userWeights: UserWeight[] = result.map((row) => {
          const formattedDate: string = FormatDateString(row.date);
          return {
            id: row.id,
            weight: row.weight,
            weight_unit: row.weight_unit,
            date: row.date,
            formattedDate: formattedDate,
          };
        });

        setUserWeights(userWeights);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getUserWeights();
  }, []);

  const handleDeleteButtonPress = (userWeight: UserWeight) => {
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

      toast.success("Exercise Deleted");
    } catch (error) {
      console.log(error);
    }

    setUserWeightToDelete(undefined);
    deleteModal.onClose();
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
                <p>
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
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Weight List
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              {userWeights.map((userWeight) => (
                <div
                  className="flex justify-between gap-4 font-medium items-center"
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
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteButtonPress(userWeight)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

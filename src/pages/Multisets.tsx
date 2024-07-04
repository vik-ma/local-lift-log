import { useState, useEffect } from "react";
import { Multiset, Exercise } from "../typings";
import MultisetModal from "../components/Modals/MultisetModal";
import {
  useDefaultMultiset,
  useDefaultSet,
  useExerciseList,
  useMultisetTypeMap,
} from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";
import {
  GetAllMultisets,
  InsertMultisetIntoDatabase,
  InsertSetIntoDatabase,
  UpdateMultisetSetOrder,
} from "../helpers";
import { DeleteModal, LoadingSpinner, MultisetAccordion } from "../components";
import toast, { Toaster } from "react-hot-toast";
import Database from "tauri-plugin-sql-api";

type OperationType = "add" | "edit" | "delete";

export default function Multisets() {
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [isSelectingExercise, setIsSelectingExercise] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [multisets, setMultisets] = useState<Multiset[]>([]);

  const defaultMultiset = useDefaultMultiset();

  const [operatingMultiset, setOperatingMultiset] =
    useState<Multiset>(defaultMultiset);

  const multisetModal = useDisclosure();
  const deleteModal = useDisclosure();

  const defaultSet = useDefaultSet(true);

  const exerciseList = useExerciseList();

  const { multisetTypeMap } = useMultisetTypeMap();

  useEffect(() => {
    const loadMultisets = async () => {
      try {
        const multisets = await GetAllMultisets();

        setMultisets(multisets);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    loadMultisets();
  }, []);

  const handleCreateNewMultisetButton = () => {
    if (operationType !== "add") {
      resetMultiset();
    }
    multisetModal.onOpen();
  };

  const resetMultiset = () => {
    setOperationType("add");
    setOperatingMultiset(defaultMultiset);
  };

  const handleClickExercise = (exercise: Exercise) => {
    const newSet = {
      ...defaultSet,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
    };

    const newSetList = [...operatingMultiset.setList, newSet];

    setOperatingMultiset((prev) => ({ ...prev, setList: newSetList }));

    setIsSelectingExercise(false);
  };

  const createMultiset = async () => {
    if (operationType !== "add") return;

    const multisetId = await InsertMultisetIntoDatabase(operatingMultiset);

    if (multisetId === 0) return;

    operatingMultiset.id = multisetId;

    const setListIdOrder: number[] = [];

    for (let i = 0; i < operatingMultiset.setList.length; i++) {
      operatingMultiset.setList[i].multiset_id = multisetId;

      const setId = await InsertSetIntoDatabase(operatingMultiset.setList[i]);

      if (setId === 0) return;

      setListIdOrder.push(setId);
    }

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      operatingMultiset,
      setListIdOrder
    );

    if (!success) return;

    setMultisets([...multisets, updatedMultiset]);

    resetMultiset();
    multisetModal.onClose();
    toast.success("Multiset Created");
  };

  const updateMultiset = async () => {
    if (operationType !== "edit" || operatingMultiset.id === 0) return;

    const setListIdOrder: number[] = [];

    for (let i = 0; i < operatingMultiset.setList.length; i++) {
      let setId = operatingMultiset.setList[i].id;

      if (setId === 0) {
        operatingMultiset.setList[i].multiset_id = operatingMultiset.id;

        const newSetId = await InsertSetIntoDatabase(
          operatingMultiset.setList[i]
        );

        if (newSetId === 0) return;

        setId = newSetId;
      }

      setListIdOrder.push(setId);
    }

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      operatingMultiset,
      setListIdOrder
    );

    if (!success) return;

    const updatedMultisets: Multiset[] = multisets.map((item) =>
      item.id === updatedMultiset.id ? updatedMultiset : item
    );

    setMultisets(updatedMultisets);

    resetMultiset();
    multisetModal.onClose();
    toast.success("Multiset Updated");
  };

  const deleteMultiset = async () => {
    if (operatingMultiset.id === 0 || operationType !== "delete") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from multisets WHERE id = $1", [operatingMultiset.id]);

      const updatedMultisets: Multiset[] = multisets.filter(
        (item) => item.id !== operatingMultiset.id
      );

      setMultisets(updatedMultisets);

      resetMultiset();
      toast.success("Multiset Deleted");
      deleteModal.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleMultisetAccordionClick = (multiset: Multiset, index: number) => {
    const updatedMultiset: Multiset = {
      ...multiset,
      isExpanded: !multiset.isExpanded,
    };

    const updatedMultisets = [...multisets];
    updatedMultisets[index] = updatedMultiset;

    setMultisets(updatedMultisets);
  };

  const handleMultisetOptionSelection = (key: string, multiset: Multiset) => {
    if (key === "edit") {
      setOperatingMultiset(multiset);
      setOperationType("edit");
      multisetModal.onOpen();
    } else if (key === "delete") {
      setOperatingMultiset(multiset);
      setOperationType("delete");
      deleteModal.onOpen();
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Body Measurements Entry"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete the Multiset containing{" "}
            <span className="text-yellow-600">
              {operatingMultiset.setListText}
            </span>
            ?
          </p>
        }
        deleteButtonAction={deleteMultiset}
      />
      <MultisetModal
        multisetModal={multisetModal}
        multiset={operatingMultiset}
        setMultiset={setOperatingMultiset}
        operationType={operationType}
        handleClickExercise={handleClickExercise}
        isSelectingExercise={isSelectingExercise}
        setIsSelectingExercise={setIsSelectingExercise}
        exerciseList={exerciseList}
        saveButtonAction={
          operationType === "edit" ? updateMultiset : createMultiset
        }
      />
      <div className="flex flex-col items-center gap-2">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Multisets
          </h1>
        </div>
        <MultisetAccordion
          multisets={multisets}
          handleMultisetAccordionClick={handleMultisetAccordionClick}
          handleMultisetOptionSelection={handleMultisetOptionSelection}
          multisetTypeMap={multisetTypeMap}
        />
        <Button className="font-medium" onPress={handleCreateNewMultisetButton}>
          Create New Multiset
        </Button>
      </div>
    </>
  );
}

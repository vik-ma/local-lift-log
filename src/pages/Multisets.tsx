import { useState, useEffect } from "react";
import {
  Multiset,
  Exercise,
  WorkoutSet,
  MultisetOperationType,
} from "../typings";
import MultisetModal from "../components/Modals/MultisetModal";
import {
  useDefaultMultiset,
  useDefaultSet,
  useExerciseList,
  useMultisetTypeMap,
  useMultisetActions,
} from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";
import {
  DeleteMultisetWithId,
  DeleteSetWithId,
  GetAllMultisets,
  InsertMultisetIntoDatabase,
  InsertSetIntoDatabase,
  UpdateMultisetSetOrder,
} from "../helpers";
import { DeleteModal, LoadingSpinner, MultisetAccordion } from "../components";
import toast, { Toaster } from "react-hot-toast";

export default function Multisets() {
  const [operationType, setOperationType] =
    useState<MultisetOperationType>("add");
  const [selectedExercise, setSelectedExercise] = useState<Exercise>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [multisets, setMultisets] = useState<Multiset[]>([]);
  const [newMultisetSetIndex, setNewMultisetSetIndex] = useState<number>(0);

  const defaultMultiset = useDefaultMultiset();

  const [operatingMultiset, setOperatingMultiset] =
    useState<Multiset>(defaultMultiset);

  const multisetModal = useDisclosure();
  const deleteModal = useDisclosure();

  const defaultSet = useDefaultSet(true);

  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(defaultSet);

  const exerciseList = useExerciseList();

  const { multisetTypeMap } = useMultisetTypeMap();

  const { handleMultisetSetOptionSelection } = useMultisetActions({
    setOperatingMultiset,
    setOperatingSet,
    setOperationType,
    deleteModal,
  });

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
    setOperatingSet(defaultSet);
    setNewMultisetSetIndex(0);
  };

  const handleClickExercise = (exercise: Exercise) => {
    const setId = newMultisetSetIndex - 1;

    const newSet = {
      ...defaultSet,
      id: setId,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
    };

    const newSetList = [...operatingMultiset.setList, newSet];

    setOperatingMultiset((prev) => ({ ...prev, setList: newSetList }));

    setSelectedExercise(undefined);

    setNewMultisetSetIndex((prev) => prev - 1);
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
    if (operationType !== "edit-multiset" || operatingMultiset.id === 0) return;

    const setListIdOrder: number[] = [];

    for (let i = 0; i < operatingMultiset.setList.length; i++) {
      let setId = operatingMultiset.setList[i].id;

      if (setId < 0) {
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
    if (operatingMultiset.id === 0 || operationType !== "delete-multiset")
      return;

    const success = await DeleteMultisetWithId(operatingMultiset.id);

    if (!success) return;

    const updatedMultisets: Multiset[] = multisets.filter(
      (item) => item.id !== operatingMultiset.id
    );

    setMultisets(updatedMultisets);

    resetMultiset();
    toast.success("Multiset Deleted");
    deleteModal.onClose();
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

  const removeSetFromMultiset = async () => {
    if (
      operationType !== "delete-set" ||
      operatingSet.id === 0 ||
      operatingMultiset.id === 0
    )
      return;

    const deleteSetSuccess = await DeleteSetWithId(operatingSet.id);

    if (!deleteSetSuccess) return;

    const updatedSetList = operatingMultiset.setList.filter(
      (obj) => obj.id !== operatingSet.id
    );

    operatingMultiset.setList = updatedSetList;

    const setListIdOrder = updatedSetList.map((obj) => obj.id);

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      operatingMultiset,
      setListIdOrder
    );

    if (!success) return;

    let toastMsg = "Set Removed";

    let updatedMultisets: Multiset[] = [];

    if (updatedMultiset.setList.length === 0) {
      // Delete Multiset if last set was deleted
      const deleteMultisetSuccess = await DeleteMultisetWithId(
        operatingMultiset.id
      );

      if (!deleteMultisetSuccess) return;

      updatedMultisets = multisets.filter(
        (item) => item.id !== operatingMultiset.id
      );

      toastMsg = "Multiset Deleted";
    } else {
      updatedMultisets = multisets.map((item) =>
        item.id === updatedMultiset.id ? updatedMultiset : item
      );
    }

    setMultisets(updatedMultisets);

    resetMultiset();
    deleteModal.onClose();
    toast.success(toastMsg);
  };

  const handleMultisetOptionSelection = (key: string, multiset: Multiset) => {
    if (key === "edit") {
      setOperatingMultiset(multiset);
      setOperationType("edit-multiset");
      setNewMultisetSetIndex(0);
      multisetModal.onOpen();
    } else if (key === "delete") {
      setOperatingMultiset(multiset);
      setOperationType("delete-multiset");
      deleteModal.onOpen();
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header={
          operationType === "delete-multiset" ? "Delete Multiset" : "Remove Set"
        }
        body={
          operationType === "delete-multiset" ? (
            <p className="break-words">
              Are you sure you want to permanently delete the Multiset
              containing{" "}
              <span className="text-yellow-600">
                {operatingMultiset.setListText}
              </span>
              ?
            </p>
          ) : operatingMultiset.setList.length === 1 ? (
            // If trying to delete last Set in Multiset
            <p className="break-words">
              Are you sure you want to remove{" "}
              <span className="text-yellow-600">
                {operatingSet.exercise_name}
              </span>{" "}
              and permanently delete Multiset?
            </p>
          ) : (
            <p className="break-words">
              Are you sure you want to remove{" "}
              <span className="text-yellow-600">
                {operatingSet.exercise_name}
              </span>{" "}
              from{" "}
              <span className="text-yellow-600">
                {operatingMultiset.setListText}
              </span>{" "}
              Multiset?
            </p>
          )
        }
        deleteButtonAction={
          operationType === "delete-multiset"
            ? deleteMultiset
            : removeSetFromMultiset
        }
      />
      <MultisetModal
        multisetModal={multisetModal}
        multiset={operatingMultiset}
        setMultiset={setOperatingMultiset}
        operatingSet={operatingSet}
        setOperatingSet={setOperatingSet}
        operationType={operationType}
        handleClickExercise={handleClickExercise}
        selectedExercise={selectedExercise}
        setSelectedExercise={setSelectedExercise}
        exerciseList={exerciseList}
        userSettings={userSettings}
        saveButtonAction={
          operationType === "edit-multiset" ? updateMultiset : createMultiset
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
          handleMultisetSetOptionSelection={handleMultisetSetOptionSelection}
        />
        <Button className="font-medium" onPress={handleCreateNewMultisetButton}>
          Create New Multiset
        </Button>
      </div>
    </>
  );
}

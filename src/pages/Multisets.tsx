import { useState, useEffect } from "react";
import { Multiset, Exercise, WorkoutSet, UserSettings } from "../typings";
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
  GetUserSettings,
  InsertMultisetIntoDatabase,
  InsertSetIntoDatabase,
  UpdateMultisetSetOrder,
  UpdateSet,
} from "../helpers";
import { DeleteModal, LoadingSpinner, MultisetAccordion } from "../components";
import toast, { Toaster } from "react-hot-toast";

export type OperationType = "add" | "edit" | "delete";

export default function Multisets() {
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [multisets, setMultisets] = useState<Multiset[]>([]);
  const [newMultisetSetIndex, setNewMultisetSetIndex] = useState<number>(0);
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const defaultMultiset = useDefaultMultiset();

  const [operatingMultiset, setOperatingMultiset] =
    useState<Multiset>(defaultMultiset);

  const multisetModal = useDisclosure();
  const deleteModal = useDisclosure();

  const defaultSet: WorkoutSet = {
    ...useDefaultSet(true),
    is_tracking_weight: 1,
    is_tracking_reps: 1,
  };

  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(defaultSet);

  const exerciseList = useExerciseList();

  const { multisetTypeMap } = useMultisetTypeMap();

  const multisetActions = useMultisetActions({
    setOperatingMultiset,
    setOperatingSet,
    deleteModal,
    multisetModal,
    exerciseList,
  });

  useEffect(() => {
    const loadMultisets = async () => {
      try {
        const multisets = await GetAllMultisets();

        setMultisets(multisets);
      } catch (error) {
        console.log(error);
      }
    };

    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();
      if (userSettings !== undefined) {
        setUserSettings(userSettings);
        setIsLoading(false);
      }
    };

    loadMultisets();
    loadUserSettings();
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
    multisetActions.setIsEditingSet(false);
    multisetActions.setIsSelectingExercise(false);
  };

  const handleClickExercise = (exercise: Exercise) => {
    if (multisetActions.multisetSetOperationType === "change-exercise") {
      console.log("asd")
      return;
    }

    const setId = newMultisetSetIndex - 1;

    const newSet = {
      ...defaultSet,
      id: setId,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
    };

    const newSetList = [...operatingMultiset.setList, newSet];

    setOperatingMultiset((prev) => ({ ...prev, setList: newSetList }));

    multisetActions.setIsSelectingExercise(false);

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

      operatingMultiset.setList[i].id = setId;

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

      if (setId < 0) {
        operatingMultiset.setList[i].multiset_id = operatingMultiset.id;

        const newSetId = await InsertSetIntoDatabase(
          operatingMultiset.setList[i]
        );

        if (newSetId === 0) return;

        setId = newSetId;
        operatingMultiset.setList[i].id = newSetId;
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

  const updateOperatingSet = async () => {
    if (operatingMultiset.id === 0 || operatingSet.id < 1) return;

    const success = await UpdateSet(operatingSet);

    if (!success) return;

    const updatedSetList = operatingMultiset.setList.map((item) =>
      item.id === operatingSet.id ? operatingSet : item
    );

    setOperatingMultiset((prev) => ({ ...prev, setList: updatedSetList }));

    const updatedMultisets = multisets.map((item) =>
      item.id === operatingMultiset.id ? operatingMultiset : item
    );

    setMultisets(updatedMultisets);

    multisetActions.setIsEditingSet(false);
    toast.success("Set Updated");
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
    if (operatingSet.id === 0) return;

    if (operatingSet.id < 0) {
      // If deleting non-saved Set
      const updatedSetList = operatingMultiset.setList.filter(
        (obj) => obj.id !== operatingSet.id
      );

      operatingMultiset.setList = updatedSetList;

      const updatedMultisets = multisets.filter(
        (item) => item.id !== operatingMultiset.id
      );

      setMultisets(updatedMultisets);

      deleteModal.onClose();
      return;
    }

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

      if (multisetModal.isOpen) {
        multisetModal.onClose();
      }
    } else {
      updatedMultisets = multisets.map((item) =>
        item.id === updatedMultiset.id ? updatedMultiset : item
      );
    }

    setMultisets(updatedMultisets);

    if (!multisetModal.isOpen) {
      resetMultiset();
    }

    deleteModal.onClose();
    toast.success(toastMsg);
  };

  const handleMultisetOptionSelection = (key: string, multiset: Multiset) => {
    if (key === "edit") {
      setOperatingMultiset(multiset);
      setOperationType("edit");
      setNewMultisetSetIndex(0);
      multisetActions.setIsEditingSet(false);
      multisetActions.setIsSelectingExercise(false);
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
        header={operationType === "delete" ? "Delete Multiset" : "Remove Set"}
        body={
          operationType === "delete" ? (
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
          operationType === "delete" ? deleteMultiset : removeSetFromMultiset
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
        useMultisetActions={multisetActions}
        exerciseList={exerciseList}
        userSettings={userSettings!}
        saveButtonAction={
          operationType === "edit" ? updateMultiset : createMultiset
        }
        updateOperatingSet={updateOperatingSet}
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
          handleMultisetSetOptionSelection={
            multisetActions.handleMultisetSetOptionSelection
          }
        />
        <Button className="font-medium" onPress={handleCreateNewMultisetButton}>
          Create New Multiset
        </Button>
      </div>
    </>
  );
}

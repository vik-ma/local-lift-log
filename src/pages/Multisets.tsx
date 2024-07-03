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
  GenerateSetListText,
  GetAllMultisets,
  InsertMultisetIntoDatabase,
  InsertSetIntoDatabase,
  UpdateMultiset,
} from "../helpers";
import { LoadingSpinner, MultisetAccordion } from "../components";
import toast, { Toaster } from "react-hot-toast";

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

  const saveMultiset = async () => {
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

    const setOrder = setListIdOrder.join(",");

    operatingMultiset.set_order = setOrder;
    operatingMultiset.setListText = GenerateSetListText(
      operatingMultiset.setList
    );

    const success = await UpdateMultiset(operatingMultiset);

    if (!success) return;

    setMultisets([...multisets, operatingMultiset]);

    resetMultiset();
    multisetModal.onClose();
    toast.success("Multiset Created");
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <MultisetModal
        multisetModal={multisetModal}
        multiset={operatingMultiset}
        setMultiset={setOperatingMultiset}
        operationType={operationType}
        handleClickExercise={handleClickExercise}
        isSelectingExercise={isSelectingExercise}
        setIsSelectingExercise={setIsSelectingExercise}
        exerciseList={exerciseList}
        saveButtonAction={saveMultiset}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Multisets
          </h1>
        </div>
        <MultisetAccordion
          multisets={multisets}
          handleMultisetAccordionClick={() => {}}
          handleMultisetOptionSelection={() => {}}
          multisetTypeMap={multisetTypeMap}
        />
        <Button className="font-medium" onPress={handleCreateNewMultisetButton}>
          Create New Multiset
        </Button>
      </div>
    </>
  );
}

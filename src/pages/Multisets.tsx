import { useState } from "react";
import { Multiset, Exercise } from "../typings";
import MultisetModal from "../components/Modals/MultisetModal";
import { useDefaultMultiset, useDefaultSet, useExerciseList } from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";
import {
  InsertMultisetIntoDatabase,
  InsertSetIntoDatabase,
  UpdateMultiset,
} from "../helpers";

type OperationType = "add" | "edit" | "delete";

export default function Multisets() {
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [isSelectingExercise, setIsSelectingExercise] =
    useState<boolean>(false);

  const defaultMultiset = useDefaultMultiset();

  const [operatingMultiset, setOperatingMultiset] =
    useState<Multiset>(defaultMultiset);

  const multisetModal = useDisclosure();

  const defaultSet = useDefaultSet(true);

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

    const success = await UpdateMultiset(operatingMultiset);

    if (!success) return;

    //TODO: ADD TOAST AND ADD TO LIST

    resetMultiset();
    multisetModal.onClose();
  };

  const exerciseList = useExerciseList();

  return (
    <>
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
        <Button className="font-medium" onPress={handleCreateNewMultisetButton}>
          Create New Multiset
        </Button>
      </div>
    </>
  );
}

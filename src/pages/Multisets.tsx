import { useState } from "react";
import { Multiset, Exercise } from "../typings";
import MultisetModal from "../components/Modals/MultisetModal";
import { useDefaultMultiset, useDefaultSet, useExerciseList } from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";

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
    resetMultiset();
    multisetModal.onOpen();
  };

  const resetMultiset = () => {
    setOperationType("add");
    setOperatingMultiset(defaultMultiset);
  };

  const handleClickExercise = (exercise: Exercise) => {
    const newSet = { ...defaultSet, exercise_id: exercise.id };

    const newSetList = [...operatingMultiset.setList, newSet];

    console.log(newSetList);

    setOperatingMultiset((prev) => ({ ...prev, setList: newSetList }));

    setIsSelectingExercise(false);
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

import { useState } from "react";
import { Multiset, Exercise } from "../typings";
import MultisetModal from "../components/Modals/MultisetModal";
import { useDefaultMultiset, useExerciseList } from "../hooks";
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

  const handleCreateNewMultisetButton = () => {
    resetMultiset();
    multisetModal.onOpen();
  };

  const resetMultiset = () => {
    setOperationType("add");
    setOperatingMultiset(defaultMultiset);
  };

  const handleClickExercise = (exercise: Exercise) => {
    if (operatingMultiset.exerciseIdSet.has(exercise.id)) return;

    const newExerciseIdSet = operatingMultiset.exerciseIdSet.add(exercise.id);

    const updatedMultiSet: Multiset = {
      ...operatingMultiset,
      exerciseIdSet: newExerciseIdSet,
    };

    setOperatingMultiset(updatedMultiSet);
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

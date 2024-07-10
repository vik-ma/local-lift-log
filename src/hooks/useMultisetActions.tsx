import { useDisclosure } from "@nextui-org/react";
import {
  Multiset,
  WorkoutSet,
  Exercise,
  UseExerciseListReturnType,
} from "../typings";
import { useState } from "react";
import { useDefaultExercise } from ".";
import Database from "tauri-plugin-sql-api";
import { GenerateSetListText, ReassignExerciseIdForSets } from "../helpers";

type OperationType = "" | "change-exercise" | "reassign-exercise";

type UseMultisetActionsProps = {
  operatingMultiset: Multiset;
  setOperatingMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  operatingSet: WorkoutSet;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  multisets: Multiset[];
  setMultisets: React.Dispatch<React.SetStateAction<Multiset[]>>;
  deleteModal: ReturnType<typeof useDisclosure>;
  multisetModal: ReturnType<typeof useDisclosure>;
  exerciseList: UseExerciseListReturnType;
};

export const useMultisetActions = ({
  operatingMultiset,
  setOperatingMultiset,
  operatingSet,
  setOperatingSet,
  multisets,
  setMultisets,
  deleteModal,
  multisetModal,
  exerciseList,
}: UseMultisetActionsProps) => {
  const [isSelectingExercise, setIsSelectingExercise] =
    useState<boolean>(false);
  const [isEditingSet, setIsEditingSet] = useState<boolean>(false);
  const [multisetSetOperationType, setMultisetSetOperationType] =
    useState<OperationType>("");
  const [modalShouldClose, setModalShouldClose] = useState<boolean>(false);

  const defaultExercise = useDefaultExercise();

  const [selectedMultisetExercise, setSelectedMultisetExercise] =
    useState<Exercise>(defaultExercise);

  const { exercises } = exerciseList;

  const handleEditSet = (set: WorkoutSet, multiset: Multiset) => {
    const exercise = exercises.find((obj) => obj.id === set.exercise_id);

    if (exercise === undefined) return;

    setOperatingSet(set);
    setOperatingMultiset(multiset);
    setIsEditingSet(true);
    setIsSelectingExercise(false);

    setSelectedMultisetExercise(exercise);

    if (!multisetModal.isOpen) {
      multisetModal.onOpen();
    }
  };

  const handleMultisetSetOptionSelection = (
    key: string,
    set: WorkoutSet,
    multiset: Multiset,
    modalIsOpen: boolean
  ) => {
    if (key === "edit-set") {
      handleEditSet(set, multiset);
    } else if (key === "delete-set") {
      setOperatingSet(set);
      setOperatingMultiset(multiset);
      deleteModal.onOpen();
    } else if (key === "change-exercise") {
      setOperatingSet(set);
      setOperatingMultiset(multiset);
      setMultisetSetOperationType("change-exercise");
      setIsSelectingExercise(true);
      setIsEditingSet(false);
      setModalShouldClose(!modalIsOpen);
      multisetModal.onOpen();
    } else if (key === "reassign-exercise") {
      setOperatingSet(set);
      setOperatingMultiset(multiset);
      setMultisetSetOperationType("reassign-exercise");
      setIsSelectingExercise(true);
      setIsEditingSet(false);
      setModalShouldClose(!modalIsOpen);
      multisetModal.onOpen();
    }
  };

  const changeExercise = async (exercise: Exercise): Promise<boolean> => {
    // If trying to assign same exercise
    if (exercise.id === operatingSet.id) return false;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("UPDATE sets SET exercise_id = $1 WHERE id = $2", [
        exercise.id,
        operatingSet.id,
      ]);

      const updatedSet: WorkoutSet = {
        ...operatingSet,
        exercise_id: exercise.id,
        exercise_name: exercise.name,
      };

      const updatedSetList = operatingMultiset.setList.map((item) =>
        item.id === operatingSet.id ? updatedSet : item
      );

      const updatedSetListText = GenerateSetListText(updatedSetList);

      const updatedMultiset = {
        ...operatingMultiset,
        setList: updatedSetList,
        setListText: updatedSetListText,
      };

      setOperatingMultiset(updatedMultiset);

      const updatedMultisets: Multiset[] = multisets.map((item) =>
        item.id === operatingMultiset.id ? updatedMultiset : item
      );

      setMultisets(updatedMultisets);

      setIsSelectingExercise(false);

      if (modalShouldClose) {
        closeMultisetModal();
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const reassignExercise = async (exercise: Exercise): Promise<boolean> => {
    const success = await ReassignExerciseIdForSets(
      operatingSet.exercise_id,
      exercise.id
    );

    if (!success) return false;

    const updatedMultisets: Multiset[] = [];

    for (let i = 0; i < multisets.length; i++) {
      const setList = multisets[i].setList;

      const updatedSetList: WorkoutSet[] = [];

      for (let j = 0; j < setList.length; j++) {
        const currentSet = { ...setList[j] };

        if (currentSet.exercise_id === operatingSet.exercise_id) {
          currentSet.exercise_id = exercise.id;
          currentSet.exercise_name = exercise.name;
          currentSet.hasInvalidExerciseId = false;
        }

        updatedSetList.push(currentSet);
      }

      const updatedSetListText = GenerateSetListText(updatedSetList);

      const updatedMultiset = {
        ...multisets[i],
        setList: updatedSetList,
        setListText: updatedSetListText,
      };

      updatedMultisets.push(updatedMultiset);

      if (multisets[i].id === operatingMultiset.id) {
        setOperatingMultiset(updatedMultiset);
      }
    }

    setMultisets(updatedMultisets);

    setIsSelectingExercise(false);

    if (modalShouldClose) {
      closeMultisetModal();
    }

    return true;
  };

  const closeMultisetModal = () => {
    setModalShouldClose(false);
    multisetModal.onClose();
  };

  return {
    isSelectingExercise,
    setIsSelectingExercise,
    isEditingSet,
    setIsEditingSet,
    selectedMultisetExercise,
    setSelectedMultisetExercise,
    handleMultisetSetOptionSelection,
    multisetSetOperationType,
    setMultisetSetOperationType,
    changeExercise,
    reassignExercise,
    closeMultisetModal,
  };
};

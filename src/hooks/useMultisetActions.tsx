import { useDisclosure } from "@nextui-org/react";
import {
  Multiset,
  WorkoutSet,
  Exercise,
  UseMultisetActionsReturnType,
  UseExerciseListReturnType,
} from "../typings";
import { useState } from "react";
import { useDefaultExercise } from ".";

type OperationType = "" | "change-exercise" | "reassign-exercise";

type UseMultisetActionsProps = {
  setOperatingMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  deleteModal: ReturnType<typeof useDisclosure>;
  multisetModal: ReturnType<typeof useDisclosure>;
  exerciseList: UseExerciseListReturnType;
};

export const useMultisetActions = ({
  setOperatingMultiset,
  setOperatingSet,
  deleteModal,
  multisetModal,
  exerciseList,
}: UseMultisetActionsProps): UseMultisetActionsReturnType => {
  const [isSelectingExercise, setIsSelectingExercise] =
    useState<boolean>(false);
  const [isEditingSet, setIsEditingSet] = useState<boolean>(false);
  const [multisetSetOperationType, setMultisetSetOperationType] =
    useState<OperationType>("");

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

    setSelectedMultisetExercise(exercise);
  };

  const handleMultisetSetOptionSelection = (
    key: string,
    set: WorkoutSet,
    multiset: Multiset
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
      multisetModal.onOpen();
    } else if (key === "reassign-exercise") {
      setOperatingSet(set);
      setOperatingMultiset(multiset);
      setMultisetSetOperationType("reassign-exercise");
      setIsSelectingExercise(true);
      multisetModal.onOpen();
    }
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
  };
};

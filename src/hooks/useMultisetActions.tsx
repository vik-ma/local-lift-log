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

type UseMultisetActionsProps = {
  setOperatingMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  deleteModal: ReturnType<typeof useDisclosure>;
  exerciseList: UseExerciseListReturnType;
};

export const useMultisetActions = ({
  setOperatingMultiset,
  setOperatingSet,
  deleteModal,
  exerciseList,
}: UseMultisetActionsProps): UseMultisetActionsReturnType => {
  const [isSelectingExercise, setIsSelectingExercise] =
    useState<boolean>(false);
  const [isEditingSet, setIsEditingSet] = useState<boolean>(false);

  const defaultExercise = useDefaultExercise();

  const [selectedMultisetExercise, setSelectedMultisetExercise] =
    useState<Exercise>(defaultExercise);

  const { exercises } = exerciseList;

  const handleEditSet = (set: WorkoutSet, multiset: Multiset) => {
    setOperatingSet(set);
    setOperatingMultiset(multiset);
    setIsEditingSet(true);

    const exercise = exercises.find((obj) => obj.id === set.exercise_id);

    if (exercise === undefined) return;

    // TODO: HANDLE UNKNOWN EXERCISES

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
    } else if (key === "reassign-exercise") {
      setOperatingSet(set);
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
  };
};

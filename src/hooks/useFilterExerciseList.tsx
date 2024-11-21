import { useDisclosure } from "@nextui-org/react";
import {
  UseExerciseListReturnType,
  UseFilterExerciseListReturnType,
} from "../typings";
import { useMemo, useState } from "react";

export const useFilterExerciseList = (
  useExerciseList: UseExerciseListReturnType
): UseFilterExerciseListReturnType => {
  const { exercises, exerciseGroupList, includeSecondaryGroups } =
    useExerciseList;

  const [filterQuery, setFilterQuery] = useState<string>("");

  const [shownExerciseGroups, setShownExerciseGroups] = useState<string[]>([
    ...exerciseGroupList,
  ]);

  const areExerciseGroupsFiltered = useMemo(() => {
    return shownExerciseGroups.length !== exerciseGroupList.length;
  }, [shownExerciseGroups, exerciseGroupList]);

  const exerciseGroupModal = useDisclosure();

  const filteredExercises = useMemo(() => {
    if (filterQuery !== "" || areExerciseGroupsFiltered) {
      // Only show exercises whose name or Exercise Group is included in the filterQuery
      // and whose Exercise Group is included in shownExerciseGroups
      return exercises.filter(
        (item) =>
          (item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            item
              .formattedGroupStringPrimary!.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase()) ||
            (includeSecondaryGroups &&
              item.formattedGroupStringSecondary
                ?.toLocaleLowerCase()
                .includes(filterQuery.toLocaleLowerCase()))) &&
          shownExerciseGroups.some(
            (group) =>
              item.formattedGroupStringPrimary!.includes(group) ||
              // Only include Secondary Exercise Groups if includeSecondaryGroups is true
              (includeSecondaryGroups &&
                item.formattedGroupStringSecondary !== undefined &&
                item.formattedGroupStringSecondary.includes(group))
          )
      );
    }
    return exercises;
  }, [
    exercises,
    filterQuery,
    shownExerciseGroups,
    includeSecondaryGroups,
    areExerciseGroupsFiltered,
  ]);

  return {
    filterQuery,
    setFilterQuery,
    filteredExercises,
    shownExerciseGroups,
    setShownExerciseGroups,
    exerciseGroupModal,
    areExerciseGroupsFiltered,
  };
};

import { useDisclosure } from "@nextui-org/react";
import {
  ListFilterMapKey,
  UseDisclosureReturnType,
  UseExerciseListReturnType,
  UseFilterExerciseListReturnType,
} from "../typings";
import { useMemo, useState } from "react";

export const useFilterExerciseList = (
  useExerciseList: UseExerciseListReturnType
): UseFilterExerciseListReturnType => {
  const { exercises, includeSecondaryGroups } = useExerciseList;

  const [filterQuery, setFilterQuery] = useState<string>("");
  const [filterMap, setFilterMap] = useState<Map<ListFilterMapKey, string>>(
    new Map()
  );

  const [shownExerciseGroups, setShownExerciseGroups] = useState<string[]>([]);

  const exerciseGroupModal = useDisclosure();

  const prefixMap = useMemo(() => {
    const prefixMap = new Map<ListFilterMapKey, string>();
    prefixMap.set(
      "exercise-groups",
      `Exercise Groups (${shownExerciseGroups.length}): `
    );
    return prefixMap;
  }, [shownExerciseGroups]);

  const removeFilter = () => {
    setShownExerciseGroups([]);
    setFilterMap(new Map());
  };

  const handleFilterSaveButton = (activeModal: UseDisclosureReturnType) => {
    const updatedFilterMap = new Map<ListFilterMapKey, string>();

    if (shownExerciseGroups.length > 0) {
      const filterExerciseGroupsString =
        Array.from(shownExerciseGroups).join(", ");

      updatedFilterMap.set("exercise-groups", filterExerciseGroupsString);
    }

    setFilterMap(updatedFilterMap);

    activeModal.onClose();
  };

  const filteredExercises = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
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
    filterMap,
  ]);

  return {
    filterQuery,
    setFilterQuery,
    filteredExercises,
    shownExerciseGroups,
    setShownExerciseGroups,
    exerciseGroupModal,
    filterMap,
    removeFilter,
    prefixMap,
    handleFilterSaveButton,
  };
};

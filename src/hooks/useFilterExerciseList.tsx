import { useDisclosure } from "@heroui/react";
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

  const [filterExerciseGroups, setFilterExerciseGroups] = useState<string[]>(
    []
  );

  const exerciseGroupModal = useDisclosure();

  const prefixMap = useMemo(() => {
    const prefixMap = new Map<ListFilterMapKey, string>();
    prefixMap.set(
      "exercise-groups",
      `Exercise Groups (${filterExerciseGroups.length}): `
    );
    return prefixMap;
  }, [filterExerciseGroups]);

  const removeFilter = () => {
    setFilterExerciseGroups([]);
    setFilterMap(new Map());
  };

  const handleFilterSaveButton = (activeModal: UseDisclosureReturnType) => {
    const updatedFilterMap = new Map<ListFilterMapKey, string>();

    if (filterExerciseGroups.length > 0) {
      const filterExerciseGroupsString =
        Array.from(filterExerciseGroups).join(", ");

      updatedFilterMap.set("exercise-groups", filterExerciseGroupsString);
    }

    setFilterMap(updatedFilterMap);

    activeModal.onClose();
  };

  const filteredExercises = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      // Only show exercises whose name or Exercise Group is included in the filterQuery
      // and whose Exercise Group is included in filterExerciseGroups
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
          filterExerciseGroups.some(
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
    filterExerciseGroups,
    includeSecondaryGroups,
    filterMap,
  ]);

  return {
    filterQuery,
    setFilterQuery,
    filteredExercises,
    filterExerciseGroups,
    setFilterExerciseGroups,
    exerciseGroupModal,
    filterMap,
    removeFilter,
    prefixMap,
    handleFilterSaveButton,
  };
};

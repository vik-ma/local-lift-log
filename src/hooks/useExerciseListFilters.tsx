import { useDisclosure } from "@heroui/react";
import {
  ListFilterMapKey,
  UseDisclosureReturnType,
  UseExerciseListFiltersReturnType,
  ExerciseFilterValues,
  StoreRef,
} from "../typings";
import { useMemo, useState } from "react";
import { DefaultExerciseFilterValues } from "../helpers";

type UseExerciseListFiltersProps = {
  store: StoreRef;
};

export const useExerciseListFilters = ({
  store,
}: UseExerciseListFiltersProps): UseExerciseListFiltersReturnType => {
  const [filterMap, setFilterMap] = useState<Map<ListFilterMapKey, string>>(
    new Map()
  );

  const defaultExerciseFilterValues = useMemo(
    () => DefaultExerciseFilterValues(),
    []
  );
  
  const [exerciseFilterValues, setExerciseFilterValues] =
    useState<ExerciseFilterValues>(defaultExerciseFilterValues);

  const filterExerciseGroupModal = useDisclosure();

  const prefixMap = useMemo(() => {
    const prefixMap = new Map<ListFilterMapKey, string>();
    prefixMap.set(
      "exercise-groups",
      `Exercise Groups (${exerciseFilterValues.filterExerciseGroups.length}): `
    );
    return prefixMap;
  }, [exerciseFilterValues.filterExerciseGroups]);

  const removeFilter = () => {
    setFilterMap(new Map());
    setExerciseFilterValues({ ...defaultExerciseFilterValues });
    // TODO: SAVE TO STORE
  };

  const handleFilterSaveButton = (
    filterValues: ExerciseFilterValues,
    activeModal?: UseDisclosureReturnType
  ) => {
    const updatedFilterMap = new Map<ListFilterMapKey, string>();

    const { filterExerciseGroups, includeSecondaryGroups } = filterValues;

    if (filterExerciseGroups.length > 0) {
      const filterExerciseGroupsString =
        Array.from(filterExerciseGroups).join(", ");

      updatedFilterMap.set("exercise-groups", filterExerciseGroupsString);
    }

    setFilterMap(updatedFilterMap);
    setExerciseFilterValues(filterValues);
    // TODO: SAVE TO STORE

    if (activeModal !== undefined) activeModal.onClose();
  };

  return {
    filterExerciseGroupModal,
    filterMap,
    removeFilter,
    prefixMap,
    handleFilterSaveButton,
    exerciseFilterValues,
  };
};

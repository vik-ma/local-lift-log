import { useDisclosure } from "@heroui/react";
import {
  ListFilterMapKey,
  UseDisclosureReturnType,
  UseExerciseListFiltersReturnType,
  ExerciseFilterValues,
  StoreRef,
} from "../typings";
import { useMemo, useRef, useState } from "react";
import { DefaultExerciseFilterValues } from "../helpers";

type UseExerciseListFiltersProps = {
  store: StoreRef;
};

type StoreFilterMapKey =
  | "exercise-groups"
  | "include-secondary-exercise-groups";

type ExerciseStoreFilterMap = Map<StoreFilterMapKey, string | boolean>;

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

  const storeFilters = useRef<ExerciseStoreFilterMap>(new Map());

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
    saveFilterMapToStore(new Map());
  };

  const handleFilterSaveButton = (
    filterValues: ExerciseFilterValues,
    activeModal?: UseDisclosureReturnType
  ) => {
    const updatedFilterMap = new Map<ListFilterMapKey, string>();
    const storeFilterMap: ExerciseStoreFilterMap = new Map();

    const { filterExerciseGroups, includeSecondaryGroups } = filterValues;

    if (filterExerciseGroups.length > 0) {
      const filterExerciseGroupsString = filterExerciseGroups.join(", ");

      updatedFilterMap.set("exercise-groups", filterExerciseGroupsString);

      const filterExerciseGroupsStoreString = filterExerciseGroups.join(",");

      storeFilterMap.set("exercise-groups", filterExerciseGroupsStoreString);
    }

    storeFilterMap.set(
      "include-secondary-exercise-groups",
      includeSecondaryGroups
    );

    setFilterMap(updatedFilterMap);
    setExerciseFilterValues(filterValues);
    saveFilterMapToStore(storeFilterMap);

    if (activeModal !== undefined) activeModal.onClose();
  };

  const saveFilterMapToStore = async (
    storeFilterMap: ExerciseStoreFilterMap
  ) => {
    if (store.current === null) return;

    await store.current.set("filter-map-exercises", {
      value: JSON.stringify(Array.from(storeFilterMap.entries())),
    });

    storeFilters.current = storeFilterMap;
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

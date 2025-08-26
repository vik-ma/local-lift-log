import { useDisclosure } from "@heroui/react";
import {
  ListFilterMapKey,
  UseDisclosureReturnType,
  UseExerciseListFiltersReturnType,
  ExerciseFilterValues,
  StoreRef,
  ExerciseGroupMap,
} from "../typings";
import { useMemo, useState } from "react";
import {
  DefaultExerciseFilterValues,
  GetFilterExerciseGroupsString,
} from "../helpers";

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
    exerciseGroupDictionary: ExerciseGroupMap,
    activeModal?: UseDisclosureReturnType
  ) => {
    const updatedFilterMap = new Map<ListFilterMapKey, string>();
    const storeFilterMap: ExerciseStoreFilterMap = new Map();

    const { filterExerciseGroups, includeSecondaryGroups } = filterValues;

    if (filterExerciseGroups.length > 0) {
      updatedFilterMap.set(
        "exercise-groups",
        GetFilterExerciseGroupsString(
          filterExerciseGroups,
          exerciseGroupDictionary
        )
      );

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
  };

  const loadFilterMapFromStore = async (
    exerciseGroupDictionary: ExerciseGroupMap,
    loadExerciseGroupsString: (exerciseGroupsString: string) => string[]
  ) => {
    if (store.current === null) return;

    const val = await store.current.get<{ value: string }>(
      "filter-map-exercises"
    );

    if (val === undefined) return;

    try {
      const storeFilterList: [StoreFilterMapKey, string | number | boolean][] =
        JSON.parse(val.value);

      if (!Array.isArray(storeFilterList) || storeFilterList.length === 0) {
        handleFilterSaveButton(
          defaultExerciseFilterValues,
          exerciseGroupDictionary
        );
        return;
      }

      const filterStoreValues: ExerciseFilterValues = {
        ...defaultExerciseFilterValues,
      };

      const addedKeys = new Set<StoreFilterMapKey>();

      for (const filter of storeFilterList) {
        const key = filter[0];
        const value = filter[1];

        if (key === undefined || value === undefined || addedKeys.has(key))
          continue;

        switch (key) {
          case "exercise-groups": {
            const exerciseGroupsString = value as string;

            const exerciseGroups =
              loadExerciseGroupsString(exerciseGroupsString);

            filterStoreValues.filterExerciseGroups = exerciseGroups;

            break;
          }
          case "include-secondary-exercise-groups": {
            if (value === true) {
              filterStoreValues.includeSecondaryGroups = true;
            }

            break;
          }
          default:
            break;
        }
      }

      handleFilterSaveButton(filterStoreValues, exerciseGroupDictionary);
    } catch {
      handleFilterSaveButton(
        defaultExerciseFilterValues,
        exerciseGroupDictionary
      );
    }
  };

  return {
    filterExerciseGroupModal,
    filterMap,
    removeFilter,
    prefixMap,
    handleFilterSaveButton,
    exerciseFilterValues,
    loadFilterMapFromStore,
  };
};

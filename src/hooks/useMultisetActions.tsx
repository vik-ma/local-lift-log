import {
  Multiset,
  WorkoutSet,
  Exercise,
  UseExerciseListReturnType,
  UseDisclosureReturnType,
  MultisetModalPage,
  MultisetOperationType,
  UseMultisetActionsReturnType,
  UserSettings,
  StoreRef,
} from "../typings";
import { useEffect, useState, useMemo, useRef } from "react";
import { useDefaultExercise, useListFilters, useMultisetTypeMap } from ".";
import Database from "@tauri-apps/plugin-sql";
import {
  GenerateSetListText,
  ReassignExerciseIdForSets,
  GetAllMultisetTemplates,
  UpdateItemInList,
  IsNumberValidInteger,
  DeleteItemFromList,
  DoesListOrSetHaveCommonElement,
} from "../helpers";
import { useDisclosure } from "@heroui/react";

type UseMultisetActionsProps = {
  operatingMultiset: Multiset;
  setOperatingMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  operatingSet: WorkoutSet;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  deleteModal: UseDisclosureReturnType;
  exerciseList: UseExerciseListReturnType;
  defaultMultiset: Multiset;
  store: StoreRef;
  defaultPage?: MultisetModalPage;
  userSettings?: UserSettings | undefined;
  removeSetFromMultiset?: (
    setToDelete?: WorkoutSet,
    multisetTarget?: Multiset
  ) => Promise<void>;
};

export const useMultisetActions = ({
  operatingMultiset,
  setOperatingMultiset,
  operatingSet,
  setOperatingSet,
  deleteModal,
  exerciseList,
  defaultMultiset,
  store,
  defaultPage,
  userSettings,
  removeSetFromMultiset,
}: UseMultisetActionsProps): UseMultisetActionsReturnType => {
  const [modalPage, setModalPage] = useState<MultisetModalPage>(
    defaultPage ?? "base"
  );
  const [multisetSetOperationType, setMultisetSetOperationType] =
    useState<MultisetOperationType>("add");
  const [calledOutsideModal, setCalledOutsideModal] = useState<boolean>(false);
  const [multisets, setMultisets] = useState<Multiset[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [newMultisetSetIndex, setNewMultisetSetIndex] = useState<number>(0);
  const [newExerciseList, setNewExerciseList] = useState<Exercise[]>([]);
  const [uneditedMultiset, setUneditedMultiset] =
    useState<Multiset>(defaultMultiset);
  const [setsToDelete, setSetsToDelete] = useState<Set<number>>(new Set());

  const multisetTypeMap = useMultisetTypeMap();

  const multisetModal = useDisclosure();
  const filterMultisetsModal = useDisclosure();

  const listFilters = useListFilters({
    store: store,
    useExerciseList: exerciseList,
  });

  const {
    filterMap,
    filterMultisetTypes,
    filterExercises,
    filterExerciseGroups,
  } = listFilters;

  const {
    exercises,
    exerciseGroupDictionary,
    exerciseMap,
    isExerciseListLoaded,
    includeSecondaryGroups,
  } = exerciseList;

  const isMultisetListLoaded = useRef(false);

  const filteredMultisets = useMemo(() => {
    if (filterQuery !== "" || filterMap.size > 0) {
      return multisets.filter(
        (item) =>
          (item.setListTextString
            ?.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
            multisetTypeMap
              .get(item.multiset_type)
              ?.toLocaleLowerCase()
              .includes(filterQuery.toLocaleLowerCase())) &&
          (!filterMap.has("multiset-types") ||
            filterMultisetTypes.has(item.multiset_type.toString())) &&
          (!filterMap.has("exercises") ||
            DoesListOrSetHaveCommonElement(
              filterExercises,
              item.exerciseIdSet
            )) &&
          (!filterMap.has("exercise-groups") ||
            (!includeSecondaryGroups &&
              DoesListOrSetHaveCommonElement(
                filterExerciseGroups,
                item.exerciseGroupSetPrimary
              )) ||
            (includeSecondaryGroups &&
              DoesListOrSetHaveCommonElement(
                filterExerciseGroups,
                item.exerciseGroupSetSecondary
              )))
      );
    }
    return multisets;
  }, [
    multisets,
    filterQuery,
    multisetTypeMap,
    filterMap,
    filterMultisetTypes,
    filterExercises,
    filterExerciseGroups,
    includeSecondaryGroups,
  ]);

  const defaultExercise = useDefaultExercise();

  const [selectedMultisetExercise, setSelectedMultisetExercise] =
    useState<Exercise>(defaultExercise);

  const handleEditSet = (set: WorkoutSet, multiset: Multiset) => {
    const exercise = exercises.find((obj) => obj.id === set.exercise_id);

    if (exercise === undefined) return;

    setOperatingSet(set);
    setOperatingMultiset(multiset);
    setModalPage("edit-set");

    setSelectedMultisetExercise(exercise);

    if (!multisetModal.isOpen) {
      multisetModal.onOpen();
    }
  };

  const handleMultisetSetOptionSelection = (
    key: string,
    set: WorkoutSet,
    multiset: Multiset,
    modalIsOpen: boolean,
    index: number
  ) => {
    if (key === "edit-set") {
      handleEditSet(set, multiset);
    } else if (key === "delete-set") {
      handleDeleteSet(set, multiset, modalIsOpen);
    } else if (key === "change-exercise") {
      handleChangeExercise(set, multiset, modalIsOpen, key);
    } else if (key === "reassign-exercise") {
      handleChangeExercise(set, multiset, modalIsOpen, key);
    } else if (key === "remove-set-cutoff") {
      handleRemoveSetCutoff(multiset, index);
    } else if (key === "add-set-cutoff") {
      handleInsertSetCutoff(multiset, index);
    }
  };

  const handleDeleteSet = (
    set: WorkoutSet,
    multiset: Multiset,
    modalIsOpen: boolean
  ) => {
    if (
      userSettings !== undefined &&
      userSettings.never_show_delete_modal &&
      removeSetFromMultiset !== undefined
    ) {
      removeSetFromMultiset(set, multiset);
      return;
    }

    setOperatingMultiset(multiset);

    if (modalIsOpen) {
      removeSetFromOperatingMultiset(set);
    } else {
      setOperatingSet(set);
      deleteModal.onOpen();
    }
  };

  const handleChangeExercise = (
    set: WorkoutSet,
    multiset: Multiset,
    modalIsOpen: boolean,
    operationType: "change-exercise" | "reassign-exercise"
  ) => {
    setOperatingSet(set);
    setOperatingMultiset(multiset);
    setMultisetSetOperationType(operationType);
    setModalPage("exercise-list");
    setCalledOutsideModal(!modalIsOpen);
    multisetModal.onOpen();
  };

  const handleRemoveSetCutoff = (multiset: Multiset, index: number) => {
    if (
      index === 0 ||
      multiset.setListIndexCutoffs === undefined ||
      !multiset.setListIndexCutoffs.has(index)
    )
      return;

    const indexCutoffsArray = Array.from(
      multiset.setListIndexCutoffs.entries()
    ).sort((a, b) => a[0] - b[0]);

    // Find the position of the index to remove
    const pos = indexCutoffsArray.findIndex(([key]) => key === index);

    // Remove the entry at the found position
    indexCutoffsArray.splice(pos, 1);

    // Decrement the values of subsequent entries
    for (let i = pos; i < indexCutoffsArray.length; i++) {
      indexCutoffsArray[i][1]--;
    }

    multiset.setListIndexCutoffs = new Map(indexCutoffsArray);

    setOperatingMultiset({ ...multiset, isEditedInModal: true });
  };

  const handleInsertSetCutoff = (multiset: Multiset, index: number) => {
    const idMinValue = 1;

    if (
      !IsNumberValidInteger(index, idMinValue) ||
      index >= multiset.setList.length ||
      multiset.setListIndexCutoffs === undefined ||
      multiset.setListIndexCutoffs.has(index)
    )
      return;

    const indexCutoffsArray = Array.from(
      multiset.setListIndexCutoffs.entries()
    ).sort((a, b) => a[0] - b[0]);

    // Find the correct position to insert the new index
    let pos = indexCutoffsArray.findIndex(([key]) => key >= index);

    // Append to end of list if larger than any existing index cutoff
    if (pos === -1) pos = indexCutoffsArray.length;

    // Increment the values of subsequent entries
    for (let i = pos; i < indexCutoffsArray.length; i++) {
      indexCutoffsArray[i][1]++;
    }

    // Insert the new entry
    indexCutoffsArray.splice(pos, 0, [index, pos + 1]);

    multiset.setListIndexCutoffs = new Map(indexCutoffsArray);

    setOperatingMultiset({ ...multiset, isEditedInModal: true });
  };

  const updateExerciseInOperatingSet = (exercise: Exercise) => {
    const updatedSet: WorkoutSet = {
      ...operatingSet,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      isEditedInMultiset: true,
    };

    const updatedSetList = UpdateItemInList(
      operatingMultiset.setList,
      updatedSet
    );

    const updatedSetListValues = GenerateSetListText(updatedSetList);

    const updatedMultiset = {
      ...operatingMultiset,
      setList: updatedSetList,
      setListText: updatedSetListValues.setListText,
      setListTextString: updatedSetListValues.setListTextString,
      isEditedInModal: true,
    };

    setOperatingMultiset(updatedMultiset);

    setMultisetSetOperationType("add");
    setModalPage("base");
  };

  const removeSetFromOperatingMultiset = (set: WorkoutSet) => {
    const updatedSetList = DeleteItemFromList(
      operatingMultiset.setList,
      set.id
    );

    const updatedMultiset = {
      ...operatingMultiset,
      setList: updatedSetList,
      isEditedInModal: true,
    };

    if (operatingMultiset.id !== 0) {
      const updatedSetsToDelete = new Set(setsToDelete);
      updatedSetsToDelete.add(set.id);

      setSetsToDelete(updatedSetsToDelete);
    }

    setOperatingMultiset(updatedMultiset);
  };

  const changeExerciseAndSave = async (
    exercise: Exercise
  ): Promise<{
    success: boolean;
    updatedMultiset: Multiset | undefined;
    updatedMultisets: Multiset[] | undefined;
  }> => {
    // If trying to assign same exercise
    if (exercise.id === operatingSet.id)
      return {
        success: false,
        updatedMultiset: undefined,
        updatedMultisets: undefined,
      };

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

      const updatedSetList = UpdateItemInList(
        operatingMultiset.setList,
        updatedSet
      );

      operatingMultiset.setList = updatedSetList;

      const updatedSetListValues = GenerateSetListText(updatedSetList);

      const updatedMultiset = {
        ...operatingMultiset,
        setListText: updatedSetListValues.setListText,
        setListTextString: updatedSetListValues.setListTextString,
      };

      const updatedMultisets = UpdateItemInList(multisets, updatedMultiset);

      setMultisetSetOperationType("add");

      closeMultisetModal();

      return {
        success: true,
        updatedMultiset: updatedMultiset,
        updatedMultisets: updatedMultisets,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        updatedMultiset: undefined,
        updatedMultisets: undefined,
      };
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

      const updatedSetListValues = GenerateSetListText(updatedSetList);

      const updatedMultiset = {
        ...multisets[i],
        setList: updatedSetList,
        setListText: updatedSetListValues.setListText,
        setListTextString: updatedSetListValues.setListTextString,
      };

      updatedMultisets.push(updatedMultiset);
    }

    setMultisets(updatedMultisets);

    setMultisetSetOperationType("add");

    if (calledOutsideModal) {
      closeMultisetModal();
    }

    return true;
  };

  const closeMultisetModal = () => {
    setCalledOutsideModal(false);
    multisetModal.onClose();
  };

  const clearMultiset = (
    newModalPage?: MultisetModalPage,
    newOperatingMultiset?: Multiset
  ) => {
    setNewMultisetSetIndex(0);
    setNewExerciseList([]);
    setOperatingMultiset(newOperatingMultiset ?? defaultMultiset);
    setSetsToDelete(new Set());

    if (newModalPage) setModalPage(newModalPage);
  };

  const undoOperatingMultisetChanges = () => {
    if (
      uneditedMultiset.id === 0 ||
      uneditedMultiset.id !== operatingMultiset.id
    )
      return;

    clearMultiset(undefined, { ...uneditedMultiset });
  };

  const updateOperatingSet = async (updatedSet: WorkoutSet) => {
    const updatedSetList = UpdateItemInList(
      operatingMultiset.setList,
      updatedSet
    );

    const updatedMultiset = {
      ...operatingMultiset,
      setList: updatedSetList,
      isEditedInModal: true,
    };

    setOperatingMultiset(updatedMultiset);

    setModalPage("base");
  };

  const loadMultisets = async () => {
    try {
      const multisets = await GetAllMultisetTemplates(
        exerciseGroupDictionary,
        exerciseMap.current
      );

      setMultisets(multisets);
      isMultisetListLoaded.current = true;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isExerciseListLoaded.current) {
      loadMultisets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExerciseListLoaded.current]);

  const handleOpenFilterButton = () => {
    filterMultisetsModal.onOpen();
  };

  return {
    multisets,
    setMultisets,
    modalPage,
    setModalPage,
    selectedMultisetExercise,
    setSelectedMultisetExercise,
    handleMultisetSetOptionSelection,
    multisetSetOperationType,
    setMultisetSetOperationType,
    changeExerciseAndSave,
    reassignExercise,
    closeMultisetModal,
    filterQuery,
    setFilterQuery,
    filteredMultisets,
    multisetTypeMap,
    newMultisetSetIndex,
    setNewMultisetSetIndex,
    newExerciseList,
    setNewExerciseList,
    clearMultiset,
    calledOutsideModal,
    updateExerciseInOperatingSet,
    undoOperatingMultisetChanges,
    setUneditedMultiset,
    setsToDelete,
    updateOperatingSet,
    setCalledOutsideModal,
    handleChangeExercise,
    multisetModal,
    listFilters,
    filterMultisetsModal,
    handleOpenFilterButton,
    isMultisetListLoaded,
  };
};

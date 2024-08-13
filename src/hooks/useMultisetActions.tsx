import { useDisclosure } from "@nextui-org/react";
import {
  Multiset,
  WorkoutSet,
  Exercise,
  UseExerciseListReturnType,
  UseSetTrackingInputsReturnType,
} from "../typings";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDefaultExercise, useMultisetTypeMap } from ".";
import Database from "tauri-plugin-sql-api";
import {
  GenerateSetListText,
  ReassignExerciseIdForSets,
  GetAllMultisetTemplates,
  UpdateItemInList,
  IsNumberValidId,
  DeleteItemFromList,
  ConvertSetInputValuesToNumbers,
  ConvertEmptyStringToNull,
} from "../helpers";

type OperationType = "" | "change-exercise" | "reassign-exercise";

type ModalPage = "base" | "multiset-list" | "exercise-list" | "edit-set";

type UseMultisetActionsProps = {
  operatingMultiset: Multiset;
  setOperatingMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  operatingSet: WorkoutSet;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  deleteModal: ReturnType<typeof useDisclosure>;
  multisetModal: ReturnType<typeof useDisclosure>;
  exerciseList: UseExerciseListReturnType;
  defaultMultiset: Multiset;
  operatingSetInputs: UseSetTrackingInputsReturnType;
  defaultPage?: ModalPage;
};

export const useMultisetActions = ({
  operatingMultiset,
  setOperatingMultiset,
  operatingSet,
  setOperatingSet,
  deleteModal,
  multisetModal,
  exerciseList,
  defaultMultiset,
  operatingSetInputs,
  defaultPage,
}: UseMultisetActionsProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>(defaultPage ?? "base");
  const [multisetSetOperationType, setMultisetSetOperationType] =
    useState<OperationType>("");
  const [calledOutsideModal, setCalledOutsideModal] = useState<boolean>(false);
  const [multisets, setMultisets] = useState<Multiset[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [newMultisetSetIndex, setNewMultisetSetIndex] = useState<number>(0);
  const [newExerciseList, setNewExerciseList] = useState<Exercise[]>([]);
  const [uneditedMultiset, setUneditedMultiset] =
    useState<Multiset>(defaultMultiset);
  const [setsToDelete, setSetsToDelete] = useState<Set<number>>(new Set());

  const { multisetTypeMap } = useMultisetTypeMap();

  const filteredMultisets = useMemo(() => {
    if (filterQuery !== "") {
      return multisets.filter(
        (item) =>
          item
            .setListTextString!.toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          multisetTypeMap[item.multiset_type].text
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase())
      );
    }
    return multisets;
  }, [multisets, filterQuery, multisetTypeMap]);

  const defaultExercise = useDefaultExercise();

  const [selectedMultisetExercise, setSelectedMultisetExercise] =
    useState<Exercise>(defaultExercise);

  const { exercises } = exerciseList;

  const handleEditSet = (set: WorkoutSet, multiset: Multiset) => {
    const exercise = exercises.find((obj) => obj.id === set.exercise_id);

    if (exercise === undefined) return;

    setOperatingSet(set);
    setOperatingMultiset(multiset);
    setModalPage("edit-set");

    operatingSetInputs.setTrackingValuesInputStrings(set);
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
      setOperatingMultiset(multiset);
      if (modalIsOpen) {
        removeSetFromOperatingMultiset(set);
      } else {
        setOperatingSet(set);
        deleteModal.onOpen();
      }
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
    if (
      !IsNumberValidId(index) ||
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

    setMultisetSetOperationType("");
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

      setMultisetSetOperationType("");

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

    setMultisetSetOperationType("");

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
    newModalPage?: ModalPage,
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

  const updateOperatingSet = async () => {
    if (operatingMultiset.id === 0) return;

    if (operatingSetInputs.isSetTrackingValuesInvalid) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      operatingSetInputs.setTrackingValuesInput
    );

    const noteToInsert = ConvertEmptyStringToNull(operatingSet.note);

    const updatedSet: WorkoutSet = {
      ...operatingSet,
      note: noteToInsert,
      weight: setTrackingValuesNumber.weight,
      reps: setTrackingValuesNumber.reps,
      distance: setTrackingValuesNumber.distance,
      rir: setTrackingValuesNumber.rir,
      rpe: setTrackingValuesNumber.rpe,
      resistance_level: setTrackingValuesNumber.resistance_level,
      partial_reps: setTrackingValuesNumber.partial_reps,
      user_weight: setTrackingValuesNumber.user_weight,
      isEditedInMultiset: true,
    };

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

  const loadMultisets = useCallback(async () => {
    try {
      const multisets = await GetAllMultisetTemplates();
      setMultisets(multisets);
    } catch (error) {
      console.log(error);
    }
  }, [setMultisets]);

  useEffect(() => {
    loadMultisets();
  }, [loadMultisets]);

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
  };
};

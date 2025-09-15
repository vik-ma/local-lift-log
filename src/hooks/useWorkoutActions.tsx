import {
  Exercise,
  UserSettings,
  WorkoutSet,
  WorkoutTemplate,
  GroupedWorkoutSet,
  SetListNotes,
  Workout,
  Multiset,
  CalculationListItem,
  PresetsType,
  UseSetTrackingInputsReturnType,
  UserWeight,
} from "../typings";
import { useState, useEffect, useRef } from "react";
import { useDisclosure } from "@heroui/react";
import Database from "@tauri-apps/plugin-sql";

import toast from "react-hot-toast";
import {
  InsertSetIntoDatabase,
  ReassignExerciseIdForSets,
  UpdateSet,
  UpdateExerciseOrder,
  DeleteSetWithId,
  ConvertEmptyStringToNull,
  GetUserSettings,
  GetCurrentDateTimeISOString,
  ValidateISODateString,
  InsertMultisetIntoDatabase,
  GenerateMultisetSetOrderList,
  GetExerciseWithId,
  UpdateMultisetSetOrder,
  GetNumberOfUniqueExercisesInGroupedSets,
  AssignTrackingValuesIfCardio,
  UpdateSetComment,
  UpdateSetNote,
  GenerateMultisetSetListIdList,
  CreateMultisetIndexCutoffs,
  UpdateItemInList,
  DeleteItemFromList,
  DeleteIdFromList,
  AddNewSetsToMultiset,
  FindIndexInList,
  GetSetsOfLastCompletedExercise,
  CopySetTrackingValues,
  UpdateCalculationString,
  DeleteMultisetWithId,
  GetLatestUserWeight,
  IsDateStringOlderThanOneWeek,
  LoadStore,
  ValidateAndModifyUserSettings,
  GetValidatedNumNewSets,
  CreateDefaultSet,
} from "../helpers";
import {
  useMultisetActions,
  useExerciseList,
  useCalculationModal,
  usePresetsList,
} from "../hooks";
import { Store } from "@tauri-apps/plugin-store";
import {
  DEFAULT_MULTISET,
  DEFAULT_WORKOUT,
  DEFAULT_WORKOUT_TEMPLATE,
  NUM_NEW_SETS_OPTIONS_LIST,
} from "../constants";

type OperationType =
  | "add"
  | "edit"
  | "delete-set"
  | "change-exercise"
  | "reassign-exercise"
  | "delete-grouped_sets-sets"
  | "update-completed-set-time"
  | "add-sets-to-multiset"
  | "edit-multiset"
  | "add-multiset-to-multiset"
  | "merge-grouped_set";

type WorkoutNumbers = {
  numExercises: number;
  numSets: number;
};

type UseWorkoutActionsProps = {
  isTemplate: boolean;
};

export const useWorkoutActions = ({ isTemplate }: UseWorkoutActionsProps) => {
  const [workoutTemplate, setWorkoutTemplate] = useState<WorkoutTemplate>(
    DEFAULT_WORKOUT_TEMPLATE
  );
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [selectedExercise, setSelectedExercise] = useState<Exercise>();
  const [groupedSets, setGroupedSets] = useState<GroupedWorkoutSet[]>([]);
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [operatingGroupedSet, setOperatingGroupedSet] =
    useState<GroupedWorkoutSet>();
  const [shownSetListComments, setShownSetListComments] =
    useState<SetListNotes>({});
  const [isExerciseBeingDragged, setIsExerciseBeingDragged] =
    useState<boolean>(false);
  const [workoutNumbers, setWorkoutNumbers] = useState<WorkoutNumbers>({
    numExercises: 0,
    numSets: 0,
  });
  const [workout, setWorkout] = useState<Workout>(DEFAULT_WORKOUT);
  const [activeSet, setActiveSet] = useState<WorkoutSet>();
  const [incompleteSetIds, setIncompleteSetIds] = useState<number[]>([]);
  const [completedSetsMap, setCompletedSetsMap] = useState<Map<string, number>>(
    new Map()
  );
  const [isActiveSetExpanded, setIsActiveSetExpanded] =
    useState<boolean>(false);
  const [activeGroupedSet, setActiveGroupedSet] = useState<GroupedWorkoutSet>();
  const [numMultisetSets, setNumMultisetSets] = useState<number>(1);
  const [userWeight, setUserWeight] = useState<UserWeight>();
  const [showGetUserWeightButton, setShowGetUserWeightButton] =
    useState<boolean>(true);
  const [showOldUserWeightLabel, setShowOldUserWeightLabel] =
    useState<boolean>(false);

  const defaultSet = useRef<WorkoutSet>(CreateDefaultSet(isTemplate));

  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(
    defaultSet.current
  );

  const defaultMultiset = DEFAULT_MULTISET;

  const [operatingMultiset, setOperatingMultiset] =
    useState<Multiset>(defaultMultiset);

  const setModal = useDisclosure();
  const deleteModal = useDisclosure();
  const timeInputModal = useDisclosure();
  const groupedWorkoutSetListModal = useDisclosure();
  const setNotesModal = useDisclosure();

  const calculationModal = useCalculationModal();

  const store = useRef<Store>(null);

  const presetsList = usePresetsList({ store: store });

  const exerciseList = useExerciseList({ store: store });

  const { exerciseGroupDictionary, exercises, setExercises, loadExerciseList } =
    exerciseList;

  const multisetActions = useMultisetActions({
    operatingMultiset,
    setOperatingMultiset,
    operatingSet,
    setOperatingSet,
    deleteModal,
    exerciseList,
    defaultMultiset,
    store,
    defaultPage: "multiset-list",
  });

  useEffect(() => {
    const loadWorkoutActions = async () => {
      try {
        const userSettings = await GetUserSettings();

        if (userSettings === undefined) return;

        ValidateAndModifyUserSettings(
          userSettings,
          new Set([
            "default_unit_weight",
            "default_unit_distance",
            "locale",
            "time_input",
            "increment_multipliers",
            "pagination_items",
          ])
        );

        setUserSettings(userSettings);

        const emptySet: WorkoutSet = {
          ...defaultSet.current,
          weight_unit: userSettings.default_unit_weight,
          distance_unit: userSettings.default_unit_distance,
          user_weight_unit: userSettings.default_unit_weight,
        };

        defaultSet.current = emptySet;

        setOperatingSet({ ...emptySet });

        await LoadStore(store);

        const isExerciseListInModal = true;

        await loadExerciseList(userSettings, isExerciseListInModal);
      } catch (error) {
        console.log(error);
      }
    };

    loadWorkoutActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addSetsToExercise = async (newSet: WorkoutSet, numSets: string) => {
    if (selectedExercise === undefined || newSet.id !== 0) return;

    const newSets: WorkoutSet[] = [];

    const numSetsToAdd = parseInt(
      GetValidatedNumNewSets(numSets, NUM_NEW_SETS_OPTIONS_LIST)
    );

    for (let i = 0; i < numSetsToAdd; i++) {
      if (isTemplate && workoutTemplate.id !== 0) {
        newSet.workout_template_id = workoutTemplate.id;
      }

      if (!isTemplate && workout.id !== 0) {
        newSet.workout_id = workout.id;
      }

      const setId = await InsertSetIntoDatabase(newSet);

      if (setId === 0) return;

      newSets.push({ ...newSet, id: setId });
    }

    const groupedSetIndex = FindIndexInList(
      groupedSets,
      selectedExercise.id.toString()
    );

    const updatedWorkoutNumbers: WorkoutNumbers = {
      ...workoutNumbers,
      numSets: workoutNumbers.numSets + numSetsToAdd,
    };

    if (groupedSetIndex === -1) {
      // Create new GroupedWorkoutSet if exercise_id does not exist in groupedSets
      const newGroupedWorkoutSet: GroupedWorkoutSet = {
        id: selectedExercise.id.toString(),
        exerciseList: [selectedExercise],
        setList: newSets,
        isExpanded: true,
        showGroupedSetNote: selectedExercise.note ? true : false,
      };

      const newGroupedSets: GroupedWorkoutSet[] = [
        ...groupedSets,
        newGroupedWorkoutSet,
      ];

      setGroupedSets(newGroupedSets);
      await updateExerciseOrder(newGroupedSets);

      updatedWorkoutNumbers.numExercises =
        GetNumberOfUniqueExercisesInGroupedSets(newGroupedSets);

      if (!isTemplate) populateIncompleteSets(newGroupedSets);
    } else {
      // Add new Sets to groupedSets' existing Exercise's Set List
      const newList = [...groupedSets];
      newList[groupedSetIndex].setList = [
        ...newList[groupedSetIndex].setList,
        ...newSets,
      ];
      setGroupedSets(newList);

      if (!isTemplate) populateIncompleteSets(newList);
    }

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingSet();

    setModal.onClose();
    toast.success(`Set${numSetsToAdd > 1 ? "s" : ""} Added`);
  };

  const deleteSet = async (
    setToDelete?: WorkoutSet,
    groupedSetOfSet?: GroupedWorkoutSet
  ) => {
    const set = setToDelete ?? operatingSet;
    const groupedSet = groupedSetOfSet ?? operatingGroupedSet;

    if (set === undefined || groupedSet === undefined) return;

    const success = await DeleteSetWithId(set.id);

    if (!success) return;

    const groupedSetIndex = FindIndexInList(groupedSets, groupedSet.id);

    const updatedWorkoutNumbers: WorkoutNumbers = {
      ...workoutNumbers,
      numSets: workoutNumbers.numSets - 1,
    };

    const updatedSetList = DeleteItemFromList(
      groupedSets[groupedSetIndex].setList,
      set.id
    );

    if (updatedSetList.length === 0) {
      // Remove Exercise/Multiset from groupedSets if last Set in Exercise was deleted
      const updatedGroupedSets = DeleteItemFromList(groupedSets, groupedSet.id);

      setGroupedSets(updatedGroupedSets);
      updateExerciseOrder(updatedGroupedSets);

      updatedWorkoutNumbers.numExercises =
        GetNumberOfUniqueExercisesInGroupedSets(updatedGroupedSets);
    } else {
      const newGroupedSet = {
        ...groupedSet,
        setList: updatedSetList,
      };

      if (groupedSet.isMultiset && groupedSet.multiset) {
        groupedSet.multiset.setList = updatedSetList;

        const setListIdList = GenerateMultisetSetListIdList(
          groupedSet.multiset.set_order
        );

        let updatedSetListIdList = setListIdList.map((setList) =>
          DeleteIdFromList(setList, set.id)
        );

        // Remove empty setLists
        updatedSetListIdList = updatedSetListIdList.filter(
          (setList) => setList.length > 0
        );

        const { success, updatedMultiset } = await UpdateMultisetSetOrder(
          groupedSet.multiset,
          updatedSetListIdList
        );

        if (!success) return;

        const updatedIndexCutoffs =
          CreateMultisetIndexCutoffs(updatedSetListIdList);

        const setIndex = groupedSet.setList.findIndex(
          (obj) => obj.id === set.id
        );

        const updatedExerciseList = [...groupedSet.exerciseList];

        updatedExerciseList.splice(setIndex, 1);

        updatedMultiset.setListIndexCutoffs = updatedIndexCutoffs;

        newGroupedSet.multiset = updatedMultiset;
        newGroupedSet.exerciseList = updatedExerciseList;
      }

      const updatedGroupedSets = [...groupedSets];
      updatedGroupedSets[groupedSetIndex] = newGroupedSet;
      setGroupedSets(updatedGroupedSets);
    }

    // Close shownSetListComments for Set if deleted Set note was shown
    updateSetIndexInShownSetListComments(groupedSet.id, set.set_index ?? -1);

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingSet();

    toast.success(isTemplate ? "Set Removed" : "Set Deleted");
    deleteModal.onClose();

    if (completedSetsMap.has(groupedSet.id) && set.is_completed === 1) {
      // Lower the value for completedSetsMap key if deleted Set was completed
      const value = completedSetsMap.get(groupedSet.id);
      completedSetsMap.set(groupedSet.id, value! - 1);
    }

    if (!isTemplate) {
      if (set.id === activeSet?.id) {
        goToNextIncompleteSet(activeSet);
      } else if (set.is_completed === 0) {
        const updatedIncompleteSetIds = DeleteIdFromList(
          incompleteSetIds,
          set.id
        );

        setIncompleteSetIds(updatedIncompleteSetIds);
      }
    }
  };

  const updateSet = async (updatedSet: WorkoutSet) => {
    if (
      selectedExercise === undefined ||
      operatingGroupedSet === undefined ||
      updatedSet.id === 0
    )
      return;

    const success = await UpdateSet(updatedSet);

    if (!success) return;

    const groupedSetId =
      operatingSet.multiset_id > 0
        ? `m${operatingSet.multiset_id}`
        : operatingSet.exercise_id.toString();

    const groupedSetIndex = FindIndexInList(groupedSets, groupedSetId);

    const updatedSetList = UpdateItemInList(
      groupedSets[groupedSetIndex].setList,
      updatedSet
    );

    if (
      groupedSets[groupedSetIndex].isMultiset &&
      groupedSets[groupedSetIndex].multiset
    ) {
      groupedSets[groupedSetIndex].multiset.setList = updatedSetList;
    }

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[groupedSetIndex].setList = updatedSetList;
      return newList;
    });

    // Close shownSetListComments for Set if note was deleted
    if (updatedSet.note === null) {
      updateSetIndexInShownSetListComments(
        operatingGroupedSet.id,
        operatingSet.set_index ?? -1
      );
    }

    resetOperatingSet();

    setModal.onClose();
    toast.success("Set Updated");

    if (activeSet?.id === updatedSet.id) {
      if (activeSet.updateSetTrigger === undefined) {
        updatedSet.updateSetTrigger = 0;
      } else {
        updatedSet.updateSetTrigger = activeSet.updateSetTrigger += 1;
      }

      setActiveSet(updatedSet);
    }
  };

  const updateExerciseOrder = async (
    setList: GroupedWorkoutSet[] = groupedSets
  ) => {
    if (isTemplate && workoutTemplate.id !== 0) {
      await UpdateExerciseOrder(setList, workoutTemplate.id, isTemplate);
    }

    if (!isTemplate && workout.id !== 0) {
      await UpdateExerciseOrder(setList, workout.id, isTemplate);
    }

    if (isExerciseBeingDragged) setIsExerciseBeingDragged(false);
  };

  const resetOperatingSet = () => {
    setOperationType("add");
    setSelectedExercise(undefined);
    setOperatingGroupedSet(undefined);

    const emptySet: WorkoutSet = { ...defaultSet.current };

    setOperatingSet(emptySet);
  };

  const handleSaveSetButton = async (
    set: WorkoutSet,
    numSets: string,
    targetSet?: string
  ) => {
    if (operationType === "add") {
      await addSetsToExercise(set, numSets);
    }
    if (operationType === "edit") {
      await updateSet(set);
    }
    if (operationType === "add-sets-to-multiset" && targetSet) {
      await addSetsToMultiset(set, numSets, targetSet);
    }
  };

  const handleAddSetButton = () => {
    if (operationType !== "add") {
      resetOperatingSet();
    }

    setModal.onOpen();
  };

  const handleEditSet = (
    set: WorkoutSet,
    index: number,
    exercise: Exercise,
    groupedSet: GroupedWorkoutSet
  ) => {
    setOperatingSet({ ...set, set_index: index });
    setOperatingGroupedSet(groupedSet);
    setOperationType("edit");
    setSelectedExercise(exercise);

    setModal.onOpen();
  };

  const handleClickExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);

    if (
      operationType === "change-exercise" ||
      operationType === "reassign-exercise"
    ) {
      changeExercise(exercise);
      return;
    }

    if (operationType === "edit") {
      setOperatingSet((prev) => ({ ...prev, exercise_id: exercise.id }));
      return;
    }

    const updatedSet = AssignTrackingValuesIfCardio(
      operatingSet,
      exercise.formattedGroupStringPrimary ?? ""
    );

    setOperatingSet(updatedSet);
  };

  const handleChangeExercise = (groupedWorkoutSet: GroupedWorkoutSet) => {
    setSelectedExercise(undefined);
    setOperationType("change-exercise");
    setOperatingGroupedSet(groupedWorkoutSet);

    setModal.onOpen();
  };

  const handleClickSet = (
    set: WorkoutSet,
    index: number,
    exercise: Exercise,
    groupedSet: GroupedWorkoutSet
  ) => {
    if (isTemplate) {
      handleEditSet(set, index, exercise, groupedSet);
    } else {
      const newActiveSet = { ...set, set_index: index };
      setActiveSet(newActiveSet);

      setActiveGroupedSet(groupedSet);

      setIsActiveSetExpanded(true);
    }
  };

  const handleSetOptionSelection = (
    key: string,
    set: WorkoutSet,
    index: number,
    exercise: Exercise,
    groupedSet: GroupedWorkoutSet
  ) => {
    switch (key) {
      case "edit":
        handleEditSet(set, index, exercise, groupedSet);
        break;
      case "delete-set":
        handleDeleteSet(set, groupedSet);
        break;
      case "update-completed-set-time":
        handleUpdateSetTimeCompleted(set, groupedSet);
        break;
      case "change-exercise":
        handleChangeExerciseMultiset(set, groupedSet, index, key);
        break;
      case "reassign-exercise":
        handleChangeExerciseMultiset(set, groupedSet, index, key);
        break;
      case "unset-warmup": {
        const newValueIsWarmup = false;
        handleChangeWarmupForSet(set, index, groupedSet, newValueIsWarmup);
        break;
      }
      case "set-warmup": {
        const newValueIsWarmup = true;
        handleChangeWarmupForSet(set, index, groupedSet, newValueIsWarmup);
        break;
      }
      case "view-notes":
        openSetNotesModal(set, index, groupedSet);
        break;
    }
  };

  const handleChangeExerciseMultiset = (
    set: WorkoutSet,
    groupedSet: GroupedWorkoutSet,
    index: number,
    key: string
  ) => {
    if (
      groupedSet.multiset === undefined ||
      (key !== "change-exercise" && key !== "reassign-exercise")
    )
      return;

    setOperatingSet({ ...set, set_index: index });
    setOperatingGroupedSet(groupedSet);
    setOperatingMultiset(groupedSet.multiset);
    multisetActions.setMultisetSetOperationType(key);
    multisetActions.setModalPage("exercise-list");
    multisetActions.setCalledOutsideModal(true);
    multisetActions.multisetModal.onOpen();
  };

  const handleUpdateSetTimeCompleted = (
    set: WorkoutSet,
    groupedSet: GroupedWorkoutSet
  ) => {
    setOperatingSet(set);
    setOperatingGroupedSet(groupedSet);
    setOperationType("update-completed-set-time");

    timeInputModal.onOpen();
  };

  const handleDeleteSet = (set: WorkoutSet, groupedSet: GroupedWorkoutSet) => {
    if (userSettings === undefined) return;

    if (userSettings.never_show_delete_modal) {
      deleteSet(set, groupedSet);
    } else {
      setOperatingSet(set);
      setOperatingGroupedSet(groupedSet);
      setOperationType("delete-set");

      deleteModal.onOpen();
    }
  };

  const handleChangeWarmupForSet = async (
    set: WorkoutSet,
    index: number,
    groupedSet: GroupedWorkoutSet,
    newValueIsWarmup: boolean
  ) => {
    const updatedSet = {
      ...set,
      is_warmup: newValueIsWarmup ? 1 : 0,
      set_index: index,
    };

    const success = await UpdateSet(updatedSet);

    if (!success) return;

    groupedSet.setList[index] = updatedSet;

    const updatedGroupedSets = UpdateItemInList(groupedSets, groupedSet);

    setGroupedSets(updatedGroupedSets);

    toast.success("Set Updated");

    if (activeSet?.id === updatedSet.id) {
      setActiveSet(updatedSet);
    }
  };

  const handleGroupedSetOptionSelection = (
    key: string,
    groupedWorkoutSet: GroupedWorkoutSet
  ) => {
    switch (key) {
      case "reassign-exercise":
        handleReassignExercise(groupedWorkoutSet);
        break;
      case "change-exercise":
        handleChangeExercise(groupedWorkoutSet);
        break;
      case "delete-grouped_sets-sets":
        handleDeleteExerciseSets(groupedWorkoutSet);
        break;
      case "add-set-to-exercise":
        handleAddSetToExercise(groupedWorkoutSet);
        break;
      case "add-sets-to-multiset":
        handleAddSetToMultiset(groupedWorkoutSet);
        break;
      case "toggle-exercise-note":
        handleToggleExerciseNote(groupedWorkoutSet);
        break;
      case "edit-multiset":
        handleEditMultiset(groupedWorkoutSet);
        break;
      case "add-multiset":
        handleAddMultisetToMultiset(groupedWorkoutSet);
        break;
      case "fill-in-last-workout-set-values":
        handleFillInLastWorkoutSetValues(groupedWorkoutSet);
        break;
      case "convert-exercise-to-multiset":
        convertExerciseIntoMultiset(groupedWorkoutSet);
        break;
      case "split-multiset-into-exercises":
        splitMultisetIntoExercises(groupedWorkoutSet);
        break;
      case "merge-grouped_set":
        handleMergeGroupedSet(groupedWorkoutSet);
        break;
    }
  };

  const handleAddSetToExercise = async (
    groupedWorkoutSet: GroupedWorkoutSet
  ) => {
    const exercise = groupedWorkoutSet.exerciseList[0];

    let newSet: WorkoutSet = {
      ...defaultSet.current,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
    };

    if (isTemplate && workoutTemplate.id !== 0) {
      newSet.workout_template_id = workoutTemplate.id;
    }

    if (!isTemplate && workout.id !== 0) {
      newSet.workout_id = workout.id;
    }

    newSet = AssignTrackingValuesIfCardio(
      newSet,
      exercise.formattedGroupStringPrimary ?? ""
    );

    const setId = await InsertSetIntoDatabase(newSet);

    if (setId === 0) return;

    newSet = { ...newSet, id: setId };

    const groupedSetIndex = FindIndexInList(
      groupedSets,
      exercise.id.toString()
    );

    const updatedGroupedSets = [...groupedSets];

    updatedGroupedSets[groupedSetIndex].isExpanded = true;
    updatedGroupedSets[groupedSetIndex].setList.push(newSet);

    setGroupedSets(updatedGroupedSets);

    const updatedWorkoutNumbers: WorkoutNumbers = {
      ...workoutNumbers,
      numSets: workoutNumbers.numSets + 1,
    };

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingSet();
    toast.success("Set Added");
  };

  const handleDeleteExerciseSets = (groupedWorkoutSet: GroupedWorkoutSet) => {
    if (userSettings === undefined) return;

    if (userSettings.never_show_delete_modal) {
      deleteAllSetsForGroupedSet(groupedWorkoutSet);
    } else {
      setOperationType("delete-grouped_sets-sets");
      setOperatingGroupedSet(groupedWorkoutSet);

      deleteModal.onOpen();
    }
  };

  const deleteAllSetsForGroupedSet = async (
    groupedSetToDelete?: GroupedWorkoutSet
  ) => {
    const groupedSet = groupedSetToDelete ?? operatingGroupedSet;

    if (groupedSet === undefined) return;

    try {
      let statement = "";
      let id = 0;
      let exerciseId = groupedSet.exerciseList[0].id;

      if (isTemplate && workoutTemplate.id !== 0) {
        if (groupedSet.isMultiset && groupedSet.multiset !== undefined) {
          statement = `DELETE from sets WHERE multiset_id = $1
          AND workout_template_id = $2 
          AND is_template = 1`;
          exerciseId = groupedSet.multiset.id;
        } else {
          statement = `DELETE from sets WHERE exercise_id = $1 
          AND workout_template_id = $2 
          AND is_template = 1`;
        }

        id = workoutTemplate.id;
      }

      if (!isTemplate && workout.id !== 0) {
        if (groupedSet.isMultiset && groupedSet.multiset !== undefined) {
          statement = `DELETE from sets
                      WHERE multiset_id = $1 AND workout_id = $2`;
          exerciseId = groupedSet.multiset.id;
        } else {
          statement = `DELETE from sets 
          WHERE exercise_id = $1 AND workout_id = $2`;
        }

        id = workout.id;
      }

      if (id === 0) return;

      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(statement, [exerciseId, id]);

      const updatedGroupedSets = DeleteItemFromList(groupedSets, groupedSet.id);

      if (completedSetsMap.has(groupedSet.id)) {
        completedSetsMap.delete(groupedSet.id);
      }

      setGroupedSets(updatedGroupedSets);

      updateExerciseOrder(updatedGroupedSets);

      const updatedWorkoutNumbers: WorkoutNumbers = {
        ...workoutNumbers,
        numSets: workoutNumbers.numSets - result.rowsAffected,
        numExercises:
          GetNumberOfUniqueExercisesInGroupedSets(updatedGroupedSets),
      };

      setWorkoutNumbers(updatedWorkoutNumbers);

      if (!isTemplate) {
        const deletedSetIds = groupedSet.setList.map((item) => item.id);

        const updatedIncompleteSetIds = incompleteSetIds.filter(
          (num) => !deletedSetIds.includes(num)
        );

        setIncompleteSetIds(updatedIncompleteSetIds);

        if (activeGroupedSet?.id === groupedSet.id) {
          setActiveSet(undefined);
          setActiveGroupedSet(undefined);
        }
      }

      resetOperatingSet();

      deleteModal.onClose();
      toast.success("Sets Removed");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteModalButton = () => {
    if (operationType === "delete-grouped_sets-sets") {
      deleteAllSetsForGroupedSet();
    } else if (operationType === "delete-set") {
      deleteSet();
    }
  };

  const handleToggleExerciseNote = (groupedWorkoutSet: GroupedWorkoutSet) => {
    const updatedGroupedSet: GroupedWorkoutSet = {
      ...groupedWorkoutSet,
      showGroupedSetNote: !groupedWorkoutSet.showGroupedSetNote,
    };

    const updatedGroupedSets = UpdateItemInList(groupedSets, updatedGroupedSet);

    setGroupedSets(updatedGroupedSets);
  };

  const updateShownSetListComments = (groupedSetId: string, index: number) => {
    let updatedSet = new Set<number>();
    if (shownSetListComments[groupedSetId]) {
      // If shownSetListComments HAS key for exerciseId
      updatedSet = new Set(shownSetListComments[groupedSetId]);

      if (shownSetListComments[groupedSetId].has(index)) {
        updatedSet.delete(index);
      } else {
        updatedSet.add(index);
      }
    } else {
      // If shownSetListComments HAS NO key for exerciseId
      updatedSet.add(index);
    }

    setShownSetListComments((prev) => ({
      ...prev,
      [groupedSetId]: updatedSet,
    }));
  };

  const updateSetIndexInShownSetListComments = (
    groupedSetId: string,
    setIndex: number
  ) => {
    if (
      shownSetListComments[groupedSetId] &&
      shownSetListComments[groupedSetId].has(setIndex)
    ) {
      updateShownSetListComments(groupedSetId, setIndex);
    }
  };

  const handleGroupedSetAccordionClick = (groupedSet: GroupedWorkoutSet) => {
    if (isExerciseBeingDragged) return;

    const updatedGroupedSet: GroupedWorkoutSet = {
      ...groupedSet,
      isExpanded: !groupedSet.isExpanded,
    };

    const updatedGroupedSets = UpdateItemInList(groupedSets, updatedGroupedSet);

    setGroupedSets(updatedGroupedSets);
  };

  const changeExercise = async (newExercise: Exercise) => {
    if (operatingGroupedSet === undefined || operatingGroupedSet.isMultiset)
      return;

    const oldExercise = operatingGroupedSet.exerciseList[0];

    // Do nothing if trying to reassign the same Exercise
    if (oldExercise.id === newExercise.id) {
      resetOperatingSet();
      setModal.onClose();
      return;
    }

    if (operationType === "reassign-exercise") {
      // Reassign ALL sets with old exercise_id to new exercise_id
      const success = await ReassignExerciseIdForSets(
        oldExercise.id,
        newExercise.id
      );

      if (!success) return;
    } else if (operationType === "change-exercise") {
      // Just change the sets with this specific workout_template_id
      try {
        let statement = "";
        let id = 0;

        if (isTemplate && workoutTemplate.id !== 0) {
          statement = `UPDATE sets SET exercise_id = $1 
                      WHERE exercise_id = $2 
                      AND workout_template_id = $3 
                      AND is_template = 1
                      AND multiset_id = 0`;
          id = workoutTemplate.id;
        }

        if (!isTemplate && workout.id !== 0) {
          statement = `UPDATE sets SET exercise_id = $1 
                      WHERE exercise_id = $2 
                      AND workout_id = $3 
                      AND is_template = 0
                      AND multiset_id = 0`;
          id = workout.id;
        }

        if (id === 0) return;

        const db = await Database.load(import.meta.env.VITE_DB);

        db.execute(statement, [oldExercise.id, id]);

        await db.execute(statement, [newExercise.id, oldExercise.id, id]);
      } catch (error) {
        console.log(error);
        return;
      }
    } else return;

    const updatedGroupedSets =
      operationType === "reassign-exercise"
        ? reassignExerciseForMultisetGroupedSets(newExercise, oldExercise)
        : [...groupedSets];

    const newGroupedWorkoutSet = updateExerciseInGroupedSet(
      operatingGroupedSet,
      newExercise
    );

    updateGroupedSetsWithNewExercise(
      oldExercise,
      newExercise,
      newGroupedWorkoutSet,
      updatedGroupedSets
    );

    if (activeGroupedSet?.id === oldExercise.id.toString()) {
      setActiveGroupedSet(newGroupedWorkoutSet);
    }

    updateActiveSetExercise(oldExercise, newExercise);

    resetOperatingSet();

    setModal.onClose();

    toast.success(
      operationType === "reassign-exercise"
        ? "Exercise Reassigned"
        : "Exercise Changed"
    );
  };

  const reassignExerciseForMultisetGroupedSets = (
    newExercise: Exercise,
    oldExercise: Exercise
  ): GroupedWorkoutSet[] => {
    const oldExerciseId = oldExercise.id;

    const updatedGroupedSets = [...groupedSets];

    for (const groupedSet of updatedGroupedSets) {
      if (!groupedSet.isMultiset || groupedSet.multiset === undefined) continue;

      for (let i = 0; i < groupedSet.setList.length; i++) {
        if (groupedSet.setList[i].exercise_id === oldExerciseId) {
          groupedSet.setList[i].exercise_id = newExercise.id;
          groupedSet.setList[i].exercise_name = newExercise.name;
          groupedSet.setList[i].hasInvalidExerciseId = false;
          groupedSet.exerciseList[i] = newExercise;
        }
      }

      groupedSet.multiset.setList = groupedSet.setList;
    }

    return updatedGroupedSets;
  };

  const updateExerciseInGroupedSet = (
    groupedSet: GroupedWorkoutSet,
    newExercise: Exercise
  ): GroupedWorkoutSet => {
    const newGroupedWorkoutSet: GroupedWorkoutSet = {
      ...groupedSet,
      id: newExercise.id.toString(),
      exerciseList: [newExercise],
    };

    newGroupedWorkoutSet.setList.forEach((item) => {
      item.exercise_id = newExercise.id;
      item.exercise_name = newExercise.name;
    });

    return newGroupedWorkoutSet;
  };

  const updateGroupedSetsWithNewExercise = (
    oldExercise: Exercise,
    newExercise: Exercise,
    newGroupedWorkoutSet: GroupedWorkoutSet,
    updatedGroupedSets: GroupedWorkoutSet[]
  ) => {
    const oldGroupedSetIndex = FindIndexInList(
      groupedSets,
      oldExercise.id.toString()
    );

    const newGroupedSetIndex = FindIndexInList(
      groupedSets,
      newExercise.id.toString()
    );

    if (completedSetsMap.has(oldExercise.id.toString())) {
      // Change key to match new exercise id
      const newCompletedSetsMap = new Map<string, number>(completedSetsMap);

      const value = completedSetsMap.get(oldExercise.id.toString());
      newCompletedSetsMap.delete(oldExercise.id.toString());
      newCompletedSetsMap.set(newExercise.id.toString(), value!);

      setCompletedSetsMap(newCompletedSetsMap);
    }

    if (newGroupedSetIndex === -1) {
      // Create new GroupedWorkoutSet if exercise_id does not exist in groupedSets
      const newGroupedSets = [...updatedGroupedSets];
      newGroupedSets[oldGroupedSetIndex] = newGroupedWorkoutSet;

      setGroupedSets(newGroupedSets);
      updateExerciseOrder(newGroupedSets);
    } else {
      // Add old Sets to groupedSets' existing Exercise's Set List
      const newGroupedSets = [...updatedGroupedSets];

      newGroupedSets[newGroupedSetIndex].setList = [
        ...newGroupedSets[newGroupedSetIndex].setList,
        ...newGroupedWorkoutSet.setList,
      ];

      newGroupedSets.splice(oldGroupedSetIndex, 1);

      const updatedWorkoutNumbers: WorkoutNumbers = {
        ...workoutNumbers,
        numExercises: newGroupedSets.length,
      };

      setWorkoutNumbers(updatedWorkoutNumbers);

      setGroupedSets(newGroupedSets);
      updateExerciseOrder(newGroupedSets);
    }
  };

  const handleReassignExercise = (
    groupedSet: GroupedWorkoutSet,
    set?: WorkoutSet
  ) => {
    if (
      groupedSet.isMultiset &&
      groupedSet.multiset !== undefined &&
      set !== undefined
    ) {
      setOperatingGroupedSet(groupedSet);

      const modalIsOpen = false;

      multisetActions.handleChangeExercise(
        set,
        groupedSet.multiset,
        modalIsOpen,
        "reassign-exercise"
      );

      return;
    }

    setSelectedExercise(undefined);
    setOperationType("reassign-exercise");
    setOperatingGroupedSet(groupedSet);

    setModal.onOpen();
  };

  const saveActiveSet = async (set: WorkoutSet, oldDateString?: string) => {
    if (workout.id === 0 || activeGroupedSet === undefined) return;

    const isUpdatingActiveSet = set.is_completed === 1;

    const dateString = oldDateString ?? GetCurrentDateTimeISOString();

    if (!isUpdatingActiveSet) {
      set.is_completed = 1;
      set.time_completed = dateString;
    }

    const success = await UpdateSet(set);

    if (!success) return;

    const groupedSetIndex = FindIndexInList(groupedSets, activeGroupedSet.id);

    const updatedSetList = UpdateItemInList(
      groupedSets[groupedSetIndex].setList,
      set
    );

    const completedSetsValue = completedSetsMap.get(activeGroupedSet.id) ?? 0;

    if (!isUpdatingActiveSet) {
      completedSetsMap.set(activeGroupedSet.id, completedSetsValue + 1);
    }

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[groupedSetIndex].setList = updatedSetList;
      return newList;
    });

    goToNextIncompleteSet(set, isUpdatingActiveSet);
    toast.success("Set Saved");
  };

  const handleSetNotesModalButton = (value: string) => {
    if (isTemplate) {
      saveSetNote(value);
    } else {
      saveSetComment(value);
    }
  };

  const saveSetNote = async (value: string) => {
    if (operatingSet.id === 0 || operatingGroupedSet === undefined) return;

    const noteToInsert = ConvertEmptyStringToNull(value);

    const success = await UpdateSetNote(noteToInsert, operatingSet.id);

    if (!success) return;

    const updatedSet = { ...operatingSet, note: noteToInsert };

    const groupedSetIndex = FindIndexInList(
      groupedSets,
      operatingGroupedSet.id
    );

    const updatedSetList = UpdateItemInList(
      groupedSets[groupedSetIndex].setList,
      updatedSet
    );

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[groupedSetIndex].setList = updatedSetList;
      return newList;
    });

    // Close shownSetListComments for Set if comment was deleted
    if (updatedSet.note === null) {
      updateSetIndexInShownSetListComments(
        operatingGroupedSet.id,
        operatingSet.set_index ?? -1
      );
    }

    resetOperatingSet();
    toast.success("Note Saved");
    setNotesModal.onClose();
  };

  const saveSetComment = async (value: string) => {
    if (operatingSet.id === 0 || operatingGroupedSet === undefined) return;

    const commentToInsert = ConvertEmptyStringToNull(value);

    const success = await UpdateSetComment(commentToInsert, operatingSet.id);

    if (!success) return;

    const updatedSet = { ...operatingSet, comment: commentToInsert };

    if (activeSet?.id === operatingSet.id) {
      setActiveSet(updatedSet);
    }

    const groupedSetIndex = FindIndexInList(
      groupedSets,
      operatingGroupedSet.id
    );

    const updatedSetList = UpdateItemInList(
      groupedSets[groupedSetIndex].setList,
      updatedSet
    );

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[groupedSetIndex].setList = updatedSetList;
      return newList;
    });

    if (activeGroupedSet?.id === operatingGroupedSet.id) {
      const updatedGroupedSet = {
        ...activeGroupedSet,
        setList: updatedSetList,
      };
      setActiveGroupedSet(updatedGroupedSet);
    }

    // Close shownSetListComments for Set if comment was deleted
    if (updatedSet.comment === null) {
      updateSetIndexInShownSetListComments(
        operatingGroupedSet.id,
        operatingSet.set_index ?? -1
      );
    }

    resetOperatingSet();
    toast.success("Comment Saved");
    setNotesModal.onClose();
  };

  const openSetNotesModal = (
    set: WorkoutSet,
    index: number,
    groupedSet: GroupedWorkoutSet
  ) => {
    setOperatingSet({ ...set, set_index: index });
    setOperatingGroupedSet(groupedSet);

    setNotesModal.onOpen();
  };

  const goToNextIncompleteSet = (
    lastSet: WorkoutSet,
    isUpdatingActiveSet?: boolean
  ) => {
    if (incompleteSetIds.length < 2 && !isUpdatingActiveSet) {
      // If last incomplete Set
      setIncompleteSetIds([]);
      setActiveSet(undefined);
      setActiveGroupedSet(undefined);
      setIsActiveSetExpanded(false);
      return;
    }

    const lastSetIndex = incompleteSetIds.findIndex((id) => id === lastSet.id);

    let nextSetIndex = 0;

    if (lastSetIndex + 1 !== incompleteSetIds.length) {
      // Leave nextSetIndex at 0 if at end of list, but with incomplete Sets left
      // Otherwise next index in list
      nextSetIndex = lastSetIndex + 1;
    }

    for (const group of groupedSets) {
      const setList: WorkoutSet[] = group.setList;
      for (let i = 0; i < setList.length; i++) {
        if (setList[i].id === incompleteSetIds[nextSetIndex]) {
          const newActiveSet = {
            ...setList[i],
            set_index: i,
          };
          setActiveSet(newActiveSet);
          setActiveGroupedSet(group);
          break;
        }
      }
    }

    const updatedIncompleteSetIds = DeleteIdFromList(
      incompleteSetIds,
      lastSet.id
    );

    setIncompleteSetIds(updatedIncompleteSetIds);
  };

  const populateIncompleteSets = (groupedSetList: GroupedWorkoutSet[]) => {
    const incompleteSetIdList: number[] = [];
    let firstSetIndex = -1;
    const newCompletedSetsMap = new Map<string, number>();

    // Add Set ids of all incomplete Sets to incompleteSetIds list
    for (let i = 0; i < groupedSetList.length; i++) {
      const setList: WorkoutSet[] = groupedSetList[i].setList;
      let numCompletedSets = 0;
      for (let j = 0; j < setList.length; j++) {
        if (setList[j].is_completed === 0) {
          incompleteSetIdList.push(setList[j].id);
          if (firstSetIndex === -1) {
            // Set first incomplete Set as activeSet
            firstSetIndex = j;
            const newActiveSet = {
              ...setList[j],
              set_index: firstSetIndex,
            };
            setActiveSet(newActiveSet);
            setActiveGroupedSet(groupedSetList[i]);
          }
        } else {
          numCompletedSets += 1;
        }
      }
      newCompletedSetsMap.set(groupedSetList[i].id, numCompletedSets);
    }
    setIncompleteSetIds(incompleteSetIdList);
    setCompletedSetsMap(newCompletedSetsMap);
  };

  const updateSetTimeCompleted = async (newDateString: string) => {
    if (
      operationType !== "update-completed-set-time" ||
      !ValidateISODateString(newDateString) ||
      operatingSet.time_completed === null ||
      operatingGroupedSet === undefined
    )
      return;

    const updatedSet: WorkoutSet = {
      ...operatingSet,
      time_completed: newDateString,
    };

    const success = await UpdateSet(updatedSet);

    if (!success) return;

    const groupedSetIndex = FindIndexInList(
      groupedSets,
      operatingGroupedSet.id
    );

    const updatedSetList = UpdateItemInList(
      groupedSets[groupedSetIndex].setList,
      updatedSet
    );

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[groupedSetIndex].setList = updatedSetList;
      return newList;
    });

    if (activeSet?.id === updatedSet.id) {
      setActiveSet(updatedSet);
    }

    resetOperatingSet();

    toast.success("Time Updated");
    timeInputModal.onClose();
  };

  const handleAddMultisetButton = async () => {
    if (userSettings === undefined) return;

    if (operationType === "edit") {
      resetOperatingMultiset();
    }

    resetOperatingSet();

    multisetActions.multisetModal.onOpen();

    await multisetActions.loadMultisets(userSettings);
  };

  const resetOperatingMultiset = () => {
    setOperatingMultiset(defaultMultiset);

    multisetActions.clearMultiset("multiset-list");
  };

  const handleAddSetToMultiset = async (
    groupedWorkoutSet: GroupedWorkoutSet
  ) => {
    resetOperatingSet();

    setOperationType("add-sets-to-multiset");
    setNumMultisetSets(
      groupedWorkoutSet.multiset?.setListIndexCutoffs?.size ?? 1
    );
    setOperatingGroupedSet(groupedWorkoutSet);
    setModal.onOpen();
  };

  const addSetToNewMultiset = async (exercise: Exercise) => {
    const setId = multisetActions.newMultisetSetIndex - 1;

    let newSet: WorkoutSet = {
      ...operatingSet,
      id: setId,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
    };

    if (isTemplate && workoutTemplate.id !== 0) {
      newSet.workout_template_id = workoutTemplate.id;
    }

    if (!isTemplate && workout.id !== 0) {
      newSet.workout_id = workout.id;
    }

    newSet = AssignTrackingValuesIfCardio(
      newSet,
      exercise.formattedGroupStringPrimary ?? ""
    );

    const newSetList = [...operatingMultiset.setList, newSet];

    setOperatingMultiset((prev) => ({
      ...prev,
      setList: newSetList,
      isEditedInModal: true,
    }));

    multisetActions.setNewExerciseList((prev) => [...prev, exercise]);
    multisetActions.setNewMultisetSetIndex((prev) => prev - 1);

    multisetActions.setModalPage("base");
  };

  const createNewMultiset = async (noteInput: string, numSets: string) => {
    if (operationType !== "add") return;

    const noteToInsert = ConvertEmptyStringToNull(noteInput);

    operatingMultiset.note = noteToInsert;

    // Create Template Multiset
    const templateMultiset: Multiset = {
      id: 0,
      multiset_type: operatingMultiset.multiset_type,
      set_order: "",
      is_template: 1,
      note: noteToInsert,
      setList: operatingMultiset.setList.map((item) => ({ ...item })),
    };

    const templateMultisetId = await InsertMultisetIntoDatabase(
      templateMultiset
    );

    if (templateMultisetId === 0) return;

    templateMultiset.id = templateMultisetId;

    // Create Multiset for Workout/WorkoutTemplate
    operatingMultiset.is_template = 0;

    const operatingMultisetId = await InsertMultisetIntoDatabase(
      operatingMultiset
    );

    if (operatingMultisetId === 0) return;

    operatingMultiset.id = operatingMultisetId;

    const templateSetListIds: number[] = [];

    const numSetsToAdd = parseInt(
      GetValidatedNumNewSets(numSets, NUM_NEW_SETS_OPTIONS_LIST)
    );

    const operatingSetListIdList: number[][] = Array.from(
      { length: numSetsToAdd },
      () => []
    );
    const setListList: WorkoutSet[][] = Array.from(
      { length: numSetsToAdd },
      () => []
    );
    const exerciseListList: Exercise[][] = Array.from(
      { length: numSetsToAdd },
      () => []
    );

    for (let i = 0; i < operatingMultiset.setList.length; i++) {
      const templateMultisetSet = templateMultiset.setList[i];
      const operatingMultisetSet = operatingMultiset.setList[i];

      templateMultisetSet.multiset_id = templateMultisetId;
      templateMultisetSet.workout_id = 0;
      templateMultisetSet.workout_template_id = 0;

      operatingMultisetSet.multiset_id = operatingMultisetId;
      operatingMultisetSet.is_template = isTemplate ? 1 : 0;

      if (isTemplate && workoutTemplate.id !== 0) {
        operatingMultisetSet.workout_template_id = workoutTemplate.id;
      }

      if (!isTemplate && workout.id !== 0) {
        operatingMultisetSet.workout_id = workout.id;
      }

      const templateMultisetSetId = await InsertSetIntoDatabase(
        templateMultisetSet
      );

      if (templateMultisetSetId === 0) return;

      for (let j = 0; j < numSetsToAdd; j++) {
        const operatingMultisetSetId = await InsertSetIntoDatabase(
          operatingMultisetSet
        );

        if (operatingMultisetSetId === 0) return;

        const exercise = await GetExerciseWithId(
          operatingMultisetSet.exercise_id,
          exerciseGroupDictionary
        );

        const newSet = { ...operatingMultisetSet, id: operatingMultisetSetId };

        operatingSetListIdList[j].push(operatingMultisetSetId);
        setListList[j].push(newSet);
        exerciseListList[j].push(exercise);
      }

      templateMultiset.setList[i].id = templateMultisetSetId;

      templateSetListIds.push(templateMultisetSetId);
    }

    operatingMultiset.setList = setListList.flat();

    const newExerciseList = exerciseListList.flat();

    const templateMultisetUpdate = await UpdateMultisetSetOrder(
      templateMultiset,
      [templateSetListIds]
    );

    const operatingMultisetUpdate = await UpdateMultisetSetOrder(
      operatingMultiset,
      operatingSetListIdList
    );

    if (!templateMultisetUpdate.success || !operatingMultisetUpdate.success)
      return;

    const updatedTemplateMultiset = templateMultisetUpdate.updatedMultiset;
    updatedTemplateMultiset.isEditedInModal = false;

    const updatedOperatingMultiset = operatingMultisetUpdate.updatedMultiset;
    updatedOperatingMultiset.isEditedInModal = false;

    const indexCutoffs = CreateMultisetIndexCutoffs(operatingSetListIdList);

    updatedOperatingMultiset.setListIndexCutoffs = indexCutoffs;

    // Add Template Multiset to Multiset list in useMultisetActions
    multisetActions.setMultisets([
      ...multisetActions.multisets,
      updatedTemplateMultiset,
    ]);

    const newGroupedSet: GroupedWorkoutSet = {
      id: `m${updatedOperatingMultiset.id}`,
      exerciseList: newExerciseList,
      setList: updatedOperatingMultiset.setList,
      isExpanded: true,
      isMultiset: true,
      multiset: updatedOperatingMultiset,
      showGroupedSetNote: updatedOperatingMultiset.note ? true : false,
    };

    const newGroupedSets: GroupedWorkoutSet[] = [...groupedSets, newGroupedSet];

    setGroupedSets(newGroupedSets);
    await updateExerciseOrder(newGroupedSets);

    if (!isTemplate) populateIncompleteSets(newGroupedSets);

    const updatedWorkoutNumbers: WorkoutNumbers = {
      numSets: workoutNumbers.numSets + newGroupedSet.setList.length,
      numExercises: GetNumberOfUniqueExercisesInGroupedSets(newGroupedSets),
    };

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingMultiset();
    resetOperatingSet();

    multisetActions.multisetModal.onClose();
    toast.success("Multiset Created");
  };

  const addSetsToMultiset = async (
    newSet: WorkoutSet,
    numSets: string,
    targetSet: string
  ) => {
    if (
      selectedExercise === undefined ||
      operatingGroupedSet === undefined ||
      operatingGroupedSet.multiset === undefined ||
      operatingGroupedSet.multiset.setListIndexCutoffs === undefined
    )
      return;

    const targetSetNum = parseInt(targetSet);

    if (
      isNaN(targetSetNum) ||
      targetSetNum > operatingGroupedSet.multiset.setListIndexCutoffs.size
    )
      return;

    newSet.multiset_id = operatingGroupedSet.multiset.id;

    const newSets: WorkoutSet[] = [];

    const numSetsToAdd = parseInt(
      GetValidatedNumNewSets(numSets, NUM_NEW_SETS_OPTIONS_LIST)
    );

    const newSetListIdList = GenerateMultisetSetListIdList(
      operatingGroupedSet.multiset.set_order
    );

    // TODO: IT ONLY EVER ADDS ONE
    // REFACTOR OR ADD NumNewSetsDropdown TO THIS operationType IN SetModal
    for (let i = 0; i < numSetsToAdd; i++) {
      if (isTemplate && workoutTemplate.id !== 0) {
        newSet.workout_template_id = workoutTemplate.id;
      }

      if (!isTemplate && workout.id !== 0) {
        newSet.workout_id = workout.id;
      }

      const setId = await InsertSetIntoDatabase(newSet);

      if (setId === 0) return;

      newSets.push({ ...newSet, id: setId });

      newSetListIdList[targetSetNum - 1].push(setId);
    }

    const newMultiset = { ...operatingGroupedSet.multiset };

    newMultiset.setList = operatingGroupedSet.setList;

    const newExerciseList = [...operatingGroupedSet.exerciseList];
    const newExercises = Array.from(
      { length: numSetsToAdd },
      () => selectedExercise
    );

    if (
      targetSetNum === operatingGroupedSet.multiset.setListIndexCutoffs.size
    ) {
      // Add new Sets to end of setList if last Set in Multiset
      newMultiset.setList.push(...newSets);
      newExerciseList.push(...newExercises);
    } else {
      for (const [key, value] of operatingGroupedSet.multiset
        .setListIndexCutoffs) {
        // Insert new Sets at the index at which the next Multiset Set previously started
        if (value === targetSetNum + 1) {
          newMultiset.setList.splice(key, 0, ...newSets);
          newExerciseList.splice(key, 0, ...newExercises);
        }
      }
    }

    const newIndexCutoffs = CreateMultisetIndexCutoffs(newSetListIdList);

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      newMultiset,
      newSetListIdList
    );

    if (!success) return;

    updatedMultiset.setListIndexCutoffs = newIndexCutoffs;

    const groupedSetIndex = FindIndexInList(
      groupedSets,
      operatingGroupedSet.id
    );

    const newGroupedSet: GroupedWorkoutSet = {
      ...operatingGroupedSet,
      exerciseList: newExerciseList,
      setList: updatedMultiset.setList,
      multiset: updatedMultiset,
    };

    const newGroupedSets = [...groupedSets];
    newGroupedSets[groupedSetIndex] = newGroupedSet;
    setGroupedSets(newGroupedSets);

    const updatedWorkoutNumbers: WorkoutNumbers = {
      numSets: workoutNumbers.numSets + numSetsToAdd,
      numExercises: GetNumberOfUniqueExercisesInGroupedSets(newGroupedSets),
    };

    if (!isTemplate) populateIncompleteSets(newGroupedSets);

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingSet();

    setModal.onClose();
    toast.success(`Set${numSetsToAdd > 1 ? "s" : ""} Added To Multiset`);
  };

  const handleSaveMultisetButton = async (
    noteInput: string,
    numSets?: string
  ) => {
    if (operationType === "add" && numSets) {
      await createNewMultiset(noteInput, numSets);
    }
    if (operationType === "edit") {
      await updateMultiset(noteInput);
    }
  };

  const updateMultiset = async (noteInput: string) => {
    if (!operatingMultiset.isEditedInModal) {
      resetOperatingMultiset();
      multisetActions.multisetModal.onClose();
      return;
    }

    if (
      operatingMultiset.id === 0 ||
      operatingMultiset.setListIndexCutoffs === undefined ||
      operatingGroupedSet === undefined ||
      operatingGroupedSet.multiset === undefined
    )
      return;

    const noteToInsert = ConvertEmptyStringToNull(noteInput);

    operatingMultiset.note = noteToInsert;

    const setListIdList: number[][] = Array.from(
      { length: operatingMultiset.setListIndexCutoffs.size },
      () => []
    );

    const newExerciseList: Exercise[] = [];

    let targetSet = -1;

    for (let i = 0; i < operatingMultiset.setList.length; i++) {
      if (operatingMultiset.setListIndexCutoffs.has(i)) {
        targetSet++;
      }

      let setId = operatingMultiset.setList[i].id;

      if (setId < 0) {
        operatingMultiset.setList[i].multiset_id = operatingMultiset.id;

        const newSetId = await InsertSetIntoDatabase(
          operatingMultiset.setList[i]
        );

        if (newSetId === 0) return;

        setId = newSetId;
        operatingMultiset.setList[i].id = newSetId;
      }

      const exercise = await GetExerciseWithId(
        operatingMultiset.setList[i].exercise_id,
        exerciseGroupDictionary
      );

      newExerciseList.push(exercise);

      if (operatingMultiset.setList[i].isEditedInMultiset) {
        const success = await UpdateSet(operatingMultiset.setList[i]);

        if (!success) continue;

        operatingMultiset.setList[i].isEditedInMultiset = false;
      }

      setListIdList[targetSet].push(setId);
    }

    for (const setId of multisetActions.setsToDelete) {
      await DeleteSetWithId(setId);
    }

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      operatingMultiset,
      setListIdList
    );

    if (!success) return;

    updatedMultiset.isEditedInModal = false;

    const newGroupedSet: GroupedWorkoutSet = {
      ...operatingGroupedSet,
      exerciseList: newExerciseList,
      setList: updatedMultiset.setList,
      multiset: updatedMultiset,
      showGroupedSetNote: updatedMultiset.note ? true : false,
    };

    const groupedSetIndex = FindIndexInList(
      groupedSets,
      operatingGroupedSet.id
    );

    const newGroupedSets = [...groupedSets];
    newGroupedSets[groupedSetIndex] = newGroupedSet;
    setGroupedSets(newGroupedSets);

    if (!isTemplate) populateIncompleteSets(newGroupedSets);

    const updatedWorkoutNumbers: WorkoutNumbers = {
      numSets: workoutNumbers.numSets + newGroupedSet.setList.length,
      numExercises: GetNumberOfUniqueExercisesInGroupedSets(newGroupedSets),
    };

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingSet();
    resetOperatingMultiset();

    multisetActions.multisetModal.onClose();
    toast.success("Multiset Updated");
  };

  const handleEditMultiset = async (groupedSet: GroupedWorkoutSet) => {
    if (!groupedSet.multiset) return;

    resetOperatingSet();

    setOperationType("edit");
    setOperatingGroupedSet(groupedSet);
    multisetActions.clearMultiset("base", { ...groupedSet.multiset });
    multisetActions.setUneditedMultiset({ ...groupedSet.multiset });
    multisetActions.multisetModal.onOpen();
  };

  const handleClickExerciseMultiset = async (exercise: Exercise) => {
    if (multisetActions.multisetSetOperationType === "change-exercise") {
      if (multisetActions.calledOutsideModal) {
        await changeExerciseInMultiset(exercise);
      } else {
        // Change exercise in operatingMultiset, but don't save to DB
        multisetActions.updateExerciseInOperatingSet(exercise);
      }
      return;
    }

    if (multisetActions.multisetSetOperationType === "reassign-exercise") {
      await reassignExerciseAndUpdateMultiset(exercise);
      return;
    }

    addSetToNewMultiset(exercise);
  };

  const handleClickMultiset = async (multiset: Multiset, numSets: string) => {
    if (operationType === "add-multiset-to-multiset") {
      await addMultisetToMultiset(multiset, numSets);
      return;
    }

    if (operationType !== "add") return;

    const newMultiset = { ...multiset, is_template: 0 };

    const multisetId = await InsertMultisetIntoDatabase(newMultiset);

    if (multisetId === 0) return;

    newMultiset.id = multisetId;

    const templateSetListIds = GenerateMultisetSetOrderList(multiset.set_order);

    const numSetsToAdd = parseInt(
      GetValidatedNumNewSets(numSets, NUM_NEW_SETS_OPTIONS_LIST)
    );

    const { setListIdList, setListList, exerciseListList } =
      await AddNewSetsToMultiset(
        numSetsToAdd,
        templateSetListIds,
        isTemplate,
        multisetId,
        isTemplate ? undefined : workout,
        isTemplate ? workoutTemplate : undefined,
        exerciseGroupDictionary
      );

    const indexCutoffs = CreateMultisetIndexCutoffs(setListIdList);

    newMultiset.setList = setListList.flat();

    const newExerciseList = exerciseListList.flat();

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      newMultiset,
      setListIdList
    );

    if (!success) return;

    updatedMultiset.setListIndexCutoffs = indexCutoffs;

    const newGroupedSet: GroupedWorkoutSet = {
      id: `m${updatedMultiset.id}`,
      exerciseList: newExerciseList,
      setList: updatedMultiset.setList,
      isExpanded: true,
      isMultiset: true,
      multiset: updatedMultiset,
      showGroupedSetNote: updatedMultiset.note ? true : false,
    };

    const newGroupedSets: GroupedWorkoutSet[] = [...groupedSets, newGroupedSet];

    setGroupedSets(newGroupedSets);
    await updateExerciseOrder(newGroupedSets);

    if (!isTemplate) populateIncompleteSets(newGroupedSets);

    const updatedWorkoutNumbers: WorkoutNumbers = {
      numSets: workoutNumbers.numSets + newGroupedSet.setList.length,
      numExercises: GetNumberOfUniqueExercisesInGroupedSets(newGroupedSets),
    };

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingMultiset();
    resetOperatingSet();

    multisetActions.multisetModal.onClose();
    toast.success("Multiset Added");
  };

  const handleAddMultisetToMultiset = (groupedSet: GroupedWorkoutSet) => {
    if (!groupedSet.multiset) return;

    resetOperatingSet();

    setOperationType("add-multiset-to-multiset");
    setOperatingGroupedSet(groupedSet);
    setOperatingMultiset(groupedSet.multiset);
    multisetActions.setModalPage("multiset-list");
    multisetActions.multisetModal.onOpen();
  };

  const addMultisetToMultiset = async (
    selectedMultiset: Multiset,
    numSets: string
  ) => {
    if (
      operatingGroupedSet === undefined ||
      operatingGroupedSet.multiset === undefined
    )
      return;

    const existingSetListIds = GenerateMultisetSetListIdList(
      operatingGroupedSet.multiset.set_order
    );

    const newSetListIds = GenerateMultisetSetOrderList(
      selectedMultiset.set_order
    );

    const numSetsToAdd = parseInt(
      GetValidatedNumNewSets(numSets, NUM_NEW_SETS_OPTIONS_LIST)
    );

    const multisetId = operatingGroupedSet.multiset.id;

    const { setListIdList, setListList, exerciseListList } =
      await AddNewSetsToMultiset(
        numSetsToAdd,
        newSetListIds,
        isTemplate,
        multisetId,
        isTemplate ? undefined : workout,
        isTemplate ? workoutTemplate : undefined,
        exerciseGroupDictionary
      );

    setListIdList.map((list) => existingSetListIds.push(list));

    const newExerciseList = [...operatingGroupedSet.exerciseList];
    newExerciseList.push(...exerciseListList.flat());

    const newSetList = [...operatingGroupedSet.setList];
    newSetList.push(...setListList.flat());

    const newMultiset = { ...operatingGroupedSet.multiset };
    newMultiset.setList = newSetList;

    const updatedIndexCutoffs = CreateMultisetIndexCutoffs(existingSetListIds);
    newMultiset.setListIndexCutoffs = updatedIndexCutoffs;

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      newMultiset,
      existingSetListIds
    );

    if (!success) return;

    const newGroupedSet: GroupedWorkoutSet = {
      ...operatingGroupedSet,
      exerciseList: newExerciseList,
      setList: updatedMultiset.setList,
      multiset: updatedMultiset,
    };

    const newGroupedSets = UpdateItemInList(groupedSets, newGroupedSet);

    setGroupedSets(newGroupedSets);

    if (!isTemplate) populateIncompleteSets(newGroupedSets);

    const updatedWorkoutNumbers: WorkoutNumbers = {
      numSets: workoutNumbers.numSets + newGroupedSet.setList.length,
      numExercises: GetNumberOfUniqueExercisesInGroupedSets(newGroupedSets),
    };

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingMultiset();
    resetOperatingSet();

    multisetActions.multisetModal.onClose();
    toast.success("Multiset Added");
  };

  const updateActiveSetExercise = (
    oldExercise: Exercise,
    newExercise: Exercise
  ) => {
    if (activeSet?.exercise_id === oldExercise.id) {
      setActiveSet({
        ...activeSet,
        exercise_id: newExercise.id,
        exercise_name: newExercise.name,
      });
    }
  };

  const changeExerciseInMultiset = async (newExercise: Exercise) => {
    if (operatingSet.set_index == undefined || operatingGroupedSet == undefined)
      return;

    // Change exercise and save directly to DB
    const { success, updatedMultiset } =
      await multisetActions.changeExerciseAndSave(newExercise);

    if (!success || updatedMultiset === undefined) return;

    const oldExercise =
      operatingGroupedSet.exerciseList[operatingSet.set_index];

    const updatedExerciseList = [...operatingGroupedSet.exerciseList];
    updatedExerciseList[operatingSet.set_index] = newExercise;

    const updatedGroupedSet: GroupedWorkoutSet = {
      ...operatingGroupedSet,
      setList: updatedMultiset.setList,
      multiset: updatedMultiset,
      exerciseList: updatedExerciseList,
    };

    const updatedGroupedSets = UpdateItemInList(groupedSets, updatedGroupedSet);

    setGroupedSets(updatedGroupedSets);

    if (activeGroupedSet?.id == operatingGroupedSet.id) {
      setActiveGroupedSet(updatedGroupedSet);
    }

    updateActiveSetExercise(oldExercise, newExercise);

    resetOperatingSet();
    resetOperatingMultiset();

    toast.success("Exercise Changed");
  };

  const reassignExerciseAndUpdateMultiset = async (newExercise: Exercise) => {
    if (
      operatingSet.set_index === undefined ||
      operatingGroupedSet === undefined
    )
      return;

    const success = await multisetActions.reassignExercise(newExercise);

    if (!success) return;

    const oldExercise =
      operatingGroupedSet.exerciseList[operatingSet.set_index];

    const updatedGroupedSets = reassignExerciseForMultisetGroupedSets(
      newExercise,
      oldExercise
    );

    const groupedSetWithExerciseIndex = FindIndexInList(
      groupedSets,
      oldExercise.id.toString()
    );

    if (groupedSetWithExerciseIndex !== -1) {
      // Update non-Multiset groupedSet exist for reassigned Exercise if it exists

      const newGroupedWorkoutSet = updateExerciseInGroupedSet(
        groupedSets[groupedSetWithExerciseIndex],
        newExercise
      );

      updateGroupedSetsWithNewExercise(
        oldExercise,
        newExercise,
        newGroupedWorkoutSet,
        updatedGroupedSets
      );
    }

    updateActiveSetExercise(oldExercise, newExercise);

    resetOperatingSet();
    resetOperatingMultiset();

    toast.success("Exercise Reassigned");
  };

  const populateUserWeightValues = async () => {
    if (activeSet === undefined || userSettings === undefined) return;

    let latestUserWeight = userWeight;

    if (latestUserWeight === undefined) {
      latestUserWeight = await GetLatestUserWeight();

      if (latestUserWeight === undefined) {
        setShowGetUserWeightButton(false);
        toast.error("No Body Weight Entries Added");
        return;
      }

      setUserWeight(latestUserWeight);

      if (IsDateStringOlderThanOneWeek(latestUserWeight.date)) {
        setShowOldUserWeightLabel(true);
      }
    }

    const updatedSet = {
      ...activeSet,
      user_weight: latestUserWeight.weight,
      user_weight_unit: latestUserWeight.weight_unit,
    };

    setActiveSet(updatedSet);
  };

  const handleFillInLastWorkoutSetValues = async (
    groupedSet: GroupedWorkoutSet
  ) => {
    if (groupedSet.isMultiset || isTemplate || workout.id === 0) return;

    const lastWorkoutSetList = await GetSetsOfLastCompletedExercise(
      Number(groupedSet.id),
      workout.id
    );

    if (lastWorkoutSetList.length === 0) {
      toast.error("No Sets Completed For Exercise");
      return;
    }

    const updatedGroupedSet = { ...groupedSet };

    for (let i = 0; i < updatedGroupedSet.setList.length; i++) {
      if (
        lastWorkoutSetList[i] === undefined ||
        updatedGroupedSet.setList[i].is_completed === 1
      )
        continue;

      const updatedSet = CopySetTrackingValues(
        lastWorkoutSetList[i],
        updatedGroupedSet.setList[i]
      );

      updatedSet.set_index = i;

      updatedGroupedSet.setList[i] = updatedSet;

      if (activeSet?.id === updatedSet.id) {
        setActiveSet(updatedSet);
        setActiveGroupedSet(updatedGroupedSet);
      }
    }

    const updatedGroupedSets = UpdateItemInList(groupedSets, updatedGroupedSet);

    setGroupedSets(updatedGroupedSets);
  };

  const addCalculationResult = async (
    value: number,
    presetsType: PresetsType,
    calculationList: CalculationListItem[],
    exercise: Exercise,
    totalMultiplier: number,
    isActiveSet: boolean
  ) => {
    if (isActiveSet && activeSet === undefined) return;

    const updatedSet =
      isActiveSet && activeSet !== undefined
        ? { ...activeSet }
        : { ...operatingSet };

    if (presetsType === "equipment") {
      updatedSet.weight = value;
    } else {
      updatedSet.distance = value;
    }

    // Needed for useEffect in SetValueConfig to trigger change in inputs
    if (updatedSet.addCalculationTrigger === undefined) {
      updatedSet.addCalculationTrigger = 0;
    } else {
      updatedSet.addCalculationTrigger++;
    }

    if (isActiveSet) {
      setActiveSet(updatedSet);
    } else {
      setOperatingSet(updatedSet);
    }

    if (userSettings?.save_calculation_string === 1) {
      const { success, updatedExercise } = await UpdateCalculationString(
        calculationList,
        presetsType,
        exercise,
        totalMultiplier
      );

      if (!success) {
        calculationModal.calculationModal.onClose();
        return;
      }

      const updatedExercises = UpdateItemInList(exercises, updatedExercise);

      setExercises(updatedExercises);

      if (selectedExercise?.id === exercise.id) {
        setSelectedExercise(updatedExercise);
      }

      const updatedGroupedSet =
        isActiveSet && activeGroupedSet !== undefined
          ? { ...activeGroupedSet }
          : !isActiveSet && operatingGroupedSet !== undefined
          ? { ...operatingGroupedSet }
          : undefined;

      if (updatedGroupedSet === undefined) {
        calculationModal.calculationModal.onClose();
        return;
      }

      const updatedExerciseList = updatedGroupedSet.exerciseList.map((obj) =>
        obj.id === updatedExercise.id ? updatedExercise : obj
      );

      updatedGroupedSet.exerciseList = updatedExerciseList;

      const newGroupedSets = UpdateItemInList(groupedSets, updatedGroupedSet);

      setGroupedSets(newGroupedSets);

      if (isActiveSet && activeGroupedSet !== undefined) {
        setActiveGroupedSet(updatedGroupedSet);
      }

      if (!isActiveSet && operatingGroupedSet !== undefined) {
        setOperatingGroupedSet(updatedGroupedSet);
      }
    }

    calculationModal.setCalculationExercise(undefined);
    calculationModal.calculationModal.onClose();
  };

  const openCalculationModal = async (
    isWeight: boolean,
    exercise: Exercise,
    isActiveSet: boolean,
    setInputs: UseSetTrackingInputsReturnType,
    set: WorkoutSet
  ) => {
    if (userSettings === undefined) return;

    await calculationModal.openCalculationModal(
      isWeight,
      exercise,
      isActiveSet,
      setInputs,
      set,
      presetsList,
      userSettings
    );
  };

  const convertExerciseIntoMultiset = async (
    groupedWorkoutSet: GroupedWorkoutSet
  ) => {
    if (
      groupedWorkoutSet.isMultiset ||
      groupedWorkoutSet.exerciseList[0] === undefined ||
      groupedWorkoutSet.exerciseList[0].isInvalid
    )
      return;

    const newMultiset: Multiset = {
      id: 0,
      multiset_type: 0,
      set_order: "",
      is_template: 0,
      note: null,
      setList: [],
    };

    const newMultisetId = await InsertMultisetIntoDatabase(newMultiset);

    if (newMultisetId === 0) return;

    newMultiset.id = newMultisetId;

    const updatedSetList = [...groupedWorkoutSet.setList];

    for (const set of updatedSetList) {
      set.multiset_id = newMultisetId;
      await UpdateSet(set);
    }

    groupedWorkoutSet.setList = updatedSetList;
    newMultiset.setList = updatedSetList;

    const setListIdOrder = groupedWorkoutSet.setList.map((set) => [set.id]);

    const indexCutoffs = CreateMultisetIndexCutoffs(setListIdOrder);

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      newMultiset,
      setListIdOrder
    );

    if (!success) return;

    updatedMultiset.setListIndexCutoffs = indexCutoffs;

    const newGroupedSetId = `m${updatedMultiset.id}`;

    const updatedExerciseList = Array(updatedSetList.length).fill(
      groupedWorkoutSet.exerciseList[0]
    );

    const updatedGroupedSet: GroupedWorkoutSet = {
      ...groupedWorkoutSet,
      id: newGroupedSetId,
      exerciseList: updatedExerciseList,
      isMultiset: true,
      multiset: updatedMultiset,
    };

    const oldGroupedSetIndex = FindIndexInList(
      groupedSets,
      groupedWorkoutSet.id
    );

    if (oldGroupedSetIndex === -1) return;

    const newGroupedSets = [...groupedSets];
    newGroupedSets[oldGroupedSetIndex] = updatedGroupedSet;

    setGroupedSets(newGroupedSets);
    updateExerciseOrder(newGroupedSets);

    if (!isTemplate) populateIncompleteSets(newGroupedSets);

    toast.success("Exercise Converted To Multiset");
  };

  const splitMultisetIntoExercises = async (
    groupedWorkoutSet: GroupedWorkoutSet
  ) => {
    if (
      !groupedWorkoutSet.isMultiset ||
      groupedWorkoutSet.multiset === undefined ||
      groupedWorkoutSet.exerciseList.length !== groupedWorkoutSet.setList.length
    )
      return;

    const groupedWorkoutSetsMap = new Map<number, GroupedWorkoutSet>();

    for (let i = 0; i < groupedWorkoutSet.setList.length; i++) {
      const set = groupedWorkoutSet.setList[i];
      set.multiset_id = 0;

      await UpdateSet(set);

      if (!groupedWorkoutSetsMap.has(set.exercise_id)) {
        const exercise = groupedWorkoutSet.exerciseList[i];

        const newGroupedWorkoutSet: GroupedWorkoutSet = {
          id: exercise.id.toString(),
          exerciseList: [exercise],
          setList: [],
          isExpanded: true,
          showGroupedSetNote: exercise.note ? true : false,
        };

        groupedWorkoutSetsMap.set(exercise.id, newGroupedWorkoutSet);
      }

      groupedWorkoutSetsMap.get(set.exercise_id)!.setList.push(set);
    }

    const oldMultisetGroupedSetIndex = FindIndexInList(
      groupedSets,
      groupedWorkoutSet.id
    );

    const newGroupedSetsToInsert: GroupedWorkoutSet[] = [];

    const updatedGroupedSets = [...groupedSets];

    for (const [id, groupedSet] of groupedWorkoutSetsMap) {
      const groupedSetIndex = FindIndexInList(groupedSets, id.toString());

      if (groupedSetIndex === -1) {
        // If groupedSets does NOT contain Exercise
        newGroupedSetsToInsert.push(groupedSet);
      } else {
        // If groupedSets DOES contain Exercise, add sets to Exercise
        updatedGroupedSets[groupedSetIndex].setList.push(...groupedSet.setList);
      }
    }

    // Remove old Multiset
    updatedGroupedSets.splice(oldMultisetGroupedSetIndex, 1);

    // Insert new Exercises at same index as old Multiset
    updatedGroupedSets.splice(
      oldMultisetGroupedSetIndex,
      0,
      ...newGroupedSetsToInsert
    );

    await DeleteMultisetWithId(groupedWorkoutSet.multiset.id);

    setGroupedSets(updatedGroupedSets);
    updateExerciseOrder(updatedGroupedSets);

    if (!isTemplate) populateIncompleteSets(updatedGroupedSets);

    toast.success("Multiset Separated Into Exercises");
  };

  const handleMergeGroupedSet = (groupedWorkoutSet: GroupedWorkoutSet) => {
    setOperationType("merge-grouped_set");
    setOperatingGroupedSet(groupedWorkoutSet);

    groupedWorkoutSetListModal.onOpen();
  };

  const mergeGroupedSets = async (groupedWorkoutSet: GroupedWorkoutSet) => {
    if (!groupedWorkoutSet.isMultiset) {
      await mergeExerciseWithExercise(groupedWorkoutSet);
    } else {
      await mergeExerciseWithMultiset(groupedWorkoutSet);
    }

    groupedWorkoutSetListModal.onClose();
    toast.success("Merged Exercise Into Multiset");
  };

  const mergeExerciseWithExercise = async (
    groupedWorkoutSet: GroupedWorkoutSet
  ) => {
    if (
      operatingGroupedSet === undefined ||
      operatingGroupedSet.id === groupedWorkoutSet.id
    )
      return;

    const newMultiset: Multiset = {
      id: 0,
      multiset_type: 0,
      set_order: "",
      is_template: 0,
      note: null,
      setList: [],
    };

    const newMultisetId = await InsertMultisetIntoDatabase(newMultiset);

    if (newMultisetId === 0) return;

    const maxSets = Math.max(
      operatingGroupedSet.setList.length,
      groupedWorkoutSet.setList.length
    );

    const setListIdList: number[][] = [];

    const newSetList: WorkoutSet[] = [];
    const newExerciseList: Exercise[] = [];

    newMultiset.id = newMultisetId;

    for (let i = 0; i < maxSets; i++) {
      const setIdList: number[] = [];

      if (i < groupedWorkoutSet.setList.length) {
        const set = groupedWorkoutSet.setList[i];

        set.multiset_id = newMultisetId;
        await UpdateSet(set);

        setIdList.push(set.id);
        newSetList.push(set);
        newExerciseList.push(groupedWorkoutSet.exerciseList[0]);
      }

      if (i < operatingGroupedSet.setList.length) {
        const set = operatingGroupedSet.setList[i];

        set.multiset_id = newMultisetId;
        await UpdateSet(set);

        setIdList.push(set.id);
        newSetList.push(set);
        newExerciseList.push(operatingGroupedSet.exerciseList[0]);
      }

      setListIdList.push(setIdList);
    }

    newMultiset.setList = newSetList;

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      newMultiset,
      setListIdList
    );

    if (!success) return;

    const indexCutoffs = CreateMultisetIndexCutoffs(setListIdList);

    updatedMultiset.setListIndexCutoffs = indexCutoffs;

    const newGroupedSet: GroupedWorkoutSet = {
      id: `m${updatedMultiset.id}`,
      exerciseList: newExerciseList,
      setList: newSetList,
      isExpanded: true,
      showGroupedSetNote: false,
      isMultiset: true,
      multiset: updatedMultiset,
    };

    const oldGroupedSetIndex1 = FindIndexInList(
      groupedSets,
      groupedWorkoutSet.id
    );

    const oldGroupedSetIndex2 = FindIndexInList(
      groupedSets,
      operatingGroupedSet.id
    );

    const updatedGroupedSets = [...groupedSets];
    updatedGroupedSets[oldGroupedSetIndex1] = newGroupedSet;
    updatedGroupedSets.splice(oldGroupedSetIndex2, 1);

    setGroupedSets(updatedGroupedSets);
    updateExerciseOrder(updatedGroupedSets);

    if (!isTemplate) populateIncompleteSets(updatedGroupedSets);
  };

  const mergeExerciseWithMultiset = async (
    groupedWorkoutSet: GroupedWorkoutSet
  ) => {
    if (
      operatingGroupedSet === undefined ||
      operatingGroupedSet.id === groupedWorkoutSet.id ||
      groupedWorkoutSet.multiset === undefined ||
      groupedWorkoutSet.multiset.setListIndexCutoffs === undefined
    )
      return;

    const setListIdList: number[][] = [];

    const newSetList: WorkoutSet[] = [];
    const newExerciseList: Exercise[] = [];

    let currentSetIdList: number[] = [];
    let currentSetIndex = 0;

    for (let i = 0; i < groupedWorkoutSet.setList.length; i++) {
      if (
        groupedWorkoutSet.multiset.setListIndexCutoffs.has(i) &&
        currentSetIdList.length > 0
      ) {
        // Add operatingGroupedSet Set to the end of Multiset "Set"
        if (currentSetIndex < operatingGroupedSet.setList.length) {
          const set = operatingGroupedSet.setList[currentSetIndex];

          set.multiset_id = groupedWorkoutSet.multiset.id;
          await UpdateSet(set);

          currentSetIdList.push(set.id);
          newSetList.push(set);
          newExerciseList.push(operatingGroupedSet.exerciseList[0]);
        }

        // Add separate list for each Multiset "Set"
        setListIdList.push(currentSetIdList);
        currentSetIdList = [];
        currentSetIndex++;
      }
      currentSetIdList.push(groupedWorkoutSet.setList[i].id);
      newSetList.push(groupedWorkoutSet.setList[i]);
      newExerciseList.push(groupedWorkoutSet.exerciseList[i]);
    }

    // Add remaining Multiset "Sets" and corresponding operatingGroupedSet Set
    if (currentSetIdList.length > 0) {
      if (currentSetIndex < operatingGroupedSet.setList.length) {
        const set = operatingGroupedSet.setList[currentSetIndex];

        set.multiset_id = groupedWorkoutSet.multiset.id;
        await UpdateSet(set);

        currentSetIdList.push(set.id);
        newSetList.push(set);
        newExerciseList.push(operatingGroupedSet.exerciseList[0]);
      }

      setListIdList.push(currentSetIdList);
      currentSetIndex++;
    }

    // Add remaining operatingGroupedSet Sets as separate Multiset "Sets"
    if (operatingGroupedSet.setList.length > currentSetIndex) {
      for (
        let i = currentSetIndex;
        i < operatingGroupedSet.setList.length;
        i++
      ) {
        const set = operatingGroupedSet.setList[i];

        set.multiset_id = groupedWorkoutSet.multiset.id;
        await UpdateSet(set);

        setListIdList.push([set.id]);
        newSetList.push(set);
        newExerciseList.push(operatingGroupedSet.exerciseList[0]);
      }
    }

    groupedWorkoutSet.multiset.setList = newSetList;

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      groupedWorkoutSet.multiset,
      setListIdList
    );

    if (!success) return;

    const updatedIndexCutoffs = CreateMultisetIndexCutoffs(setListIdList);

    updatedMultiset.setListIndexCutoffs = updatedIndexCutoffs;

    const updatedGroupedSet: GroupedWorkoutSet = {
      ...groupedWorkoutSet,
      exerciseList: newExerciseList,
      setList: newSetList,
      isExpanded: true,
      multiset: updatedMultiset,
    };

    const oldGroupedSetIndex1 = FindIndexInList(
      groupedSets,
      groupedWorkoutSet.id
    );

    const oldGroupedSetIndex2 = FindIndexInList(
      groupedSets,
      operatingGroupedSet.id
    );

    const updatedGroupedSets = [...groupedSets];
    updatedGroupedSets[oldGroupedSetIndex1] = updatedGroupedSet;
    updatedGroupedSets.splice(oldGroupedSetIndex2, 1);

    setGroupedSets(updatedGroupedSets);
    updateExerciseOrder(updatedGroupedSets);

    if (!isTemplate) populateIncompleteSets(updatedGroupedSets);
  };

  return {
    updateExerciseOrder,
    handleSaveSetButton,
    handleAddSetButton,
    handleClickExercise,
    handleClickSet,
    handleSetOptionSelection,
    handleGroupedSetOptionSelection,
    handleDeleteModalButton,
    updateShownSetListComments,
    handleGroupedSetAccordionClick,
    handleReassignExercise,
    groupedSets,
    setGroupedSets,
    userSettings,
    setUserSettings,
    operatingSet,
    setOperatingSet,
    operatingGroupedSet,
    deleteModal,
    setModal,
    operationType,
    selectedExercise,
    setSelectedExercise,
    shownSetListComments,
    setIsExerciseBeingDragged,
    workoutTemplate,
    setWorkoutTemplate,
    workout,
    setWorkout,
    activeSet,
    setActiveSet,
    saveActiveSet,
    populateIncompleteSets,
    isActiveSetExpanded,
    setIsActiveSetExpanded,
    activeGroupedSet,
    handleEditSet,
    completedSetsMap,
    timeInputModal,
    updateSetTimeCompleted,
    workoutNumbers,
    setWorkoutNumbers,
    multisetActions,
    exerciseList,
    operatingMultiset,
    setOperatingMultiset,
    handleAddMultisetButton,
    handleSaveMultisetButton,
    handleClickExerciseMultiset,
    handleClickMultiset,
    handleSetNotesModalButton,
    numMultisetSets,
    populateUserWeightValues,
    presetsList,
    calculationModal,
    addCalculationResult,
    openCalculationModal,
    groupedWorkoutSetListModal,
    mergeGroupedSets,
    userWeight,
    showGetUserWeightButton,
    showOldUserWeightLabel,
    setShowOldUserWeightLabel,
    setNotesModal,
    openSetNotesModal,
    store,
  };
};

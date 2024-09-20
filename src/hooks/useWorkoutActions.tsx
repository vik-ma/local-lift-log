import {
  Exercise,
  UserSettings,
  WorkoutSet,
  WorkoutTemplate,
  GroupedWorkoutSet,
  SetListNotes,
  ActiveSetNote,
  Workout,
  SetTrackingValuesInput,
  Multiset,
  UserWeight,
} from "../typings";
import { useState, useCallback, useEffect } from "react";
import { useDisclosure } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";

import toast from "react-hot-toast";
import {
  ConvertSetInputValuesToNumbers,
  InsertSetIntoDatabase,
  ReassignExerciseIdForSets,
  UpdateSet,
  UpdateExerciseOrder,
  DeleteSetWithId,
  ConvertEmptyStringToNull,
  GetUserSettings,
  GetCurrentDateTimeISOString,
  ValidateISODateString,
  DefaultNewWorkout,
  DefaultNewWorkoutTemplate,
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
  GetLatestUserWeight,
  IsDateStringOlderThanOneWeek,
  GetSetsOfLastCompletedExercise,
  CopySetTrackingValues,
} from "../helpers";
import {
  useDefaultSet,
  useNumSetsOptions,
  useSetTrackingInputs,
  useDefaultSetInputValues,
  useMultisetActions,
  useDefaultMultiset,
  useExerciseList,
  useDefaultUserWeight,
  useCalculationModal,
  usePresetsList,
} from "../hooks";

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
  | "add-multiset-to-multiset";

type WorkoutNumbers = {
  numExercises: number;
  numSets: number;
};

export const useWorkoutActions = (isTemplate: boolean) => {
  const [workoutTemplate, setWorkoutTemplate] = useState<WorkoutTemplate>(
    DefaultNewWorkoutTemplate()
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

  const [workout, setWorkout] = useState<Workout>(DefaultNewWorkout());
  const [activeSet, setActiveSet] = useState<WorkoutSet>();
  const [incompleteSetIds, setIncompleteSetIds] = useState<number[]>([]);
  const [completedSetsMap, setCompletedSetsMap] = useState<Map<string, number>>(
    new Map()
  );
  const [activeSetNote, setActiveSetNote] = useState<
    ActiveSetNote | undefined
  >();
  const [isActiveSetExpanded, setIsActiveSetExpanded] =
    useState<boolean>(false);
  const [activeGroupedSet, setActiveGroupedSet] = useState<GroupedWorkoutSet>();
  const [setCommentInput, setSetCommentInput] = useState<string>("");

  const defaultUserWeight = useDefaultUserWeight();

  const [userWeight, setUserWeight] = useState<UserWeight>(defaultUserWeight);

  const [numMultisetSets, setNumMultisetSets] = useState<number>(1);

  const numSetsOptions = useNumSetsOptions();

  const defaultSet = useDefaultSet(isTemplate);

  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(defaultSet);

  const [calculationString, setCalculationString] = useState<string | null>(
    null
  );

  const defaultMultiset = useDefaultMultiset();

  const [operatingMultiset, setOperatingMultiset] =
    useState<Multiset>(defaultMultiset);

  const setModal = useDisclosure();
  const deleteModal = useDisclosure();
  const timeInputModal = useDisclosure();
  const multisetModal = useDisclosure();
  const textInputModal = useDisclosure();

  const calculationModal = useCalculationModal();

  const presetsList = usePresetsList(false, false);

  const defaultSetInputValues = useDefaultSetInputValues();

  const operatingSetInputs = useSetTrackingInputs();
  const activeSetInputs = useSetTrackingInputs();

  const exerciseList = useExerciseList();

  const multisetActions = useMultisetActions({
    operatingMultiset,
    setOperatingMultiset,
    operatingSet,
    setOperatingSet,
    deleteModal,
    multisetModal,
    exerciseList,
    defaultMultiset,
    operatingSetInputs,
    defaultPage: "multiset-list",
  });

  const [isUserWeightOlderThanOneWeek, setIsUserWeightOlderThanOneWeek] =
    useState<boolean>(false);

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const userSettings = await GetUserSettings();
        if (userSettings === undefined) return;
        setUserSettings(userSettings);
        setOperatingSet((prev) => ({
          ...prev,
          weight_unit: userSettings.default_unit_weight!,
          distance_unit: userSettings.default_unit_distance!,
          user_weight_unit: userSettings.default_unit_weight!,
        }));

        if (!isTemplate) {
          const userWeight = await GetLatestUserWeight(
            userSettings.clock_style
          );

          if (userWeight !== undefined) {
            setUserWeight(userWeight);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadUserSettings();
  }, [isTemplate]);

  const addSetsToExercise = async (numSets: string) => {
    if (selectedExercise === undefined) return;

    if (!numSetsOptions.includes(numSets)) return;

    if (operatingSetInputs.isSetTrackingValuesInvalid) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      operatingSetInputs.setTrackingValuesInput
    );

    const noteToInsert = ConvertEmptyStringToNull(operatingSet.note);

    const newSets: WorkoutSet[] = [];

    const numSetsToAdd: number = parseInt(numSets);

    for (let i = 0; i < numSetsToAdd; i++) {
      const newSet: WorkoutSet = {
        ...operatingSet,
        exercise_id: selectedExercise.id,
        note: noteToInsert,
        exercise_name: selectedExercise.name,
        weight: setTrackingValuesNumber.weight,
        reps: setTrackingValuesNumber.reps,
        distance: setTrackingValuesNumber.distance,
        rir: setTrackingValuesNumber.rir,
        rpe: setTrackingValuesNumber.rpe,
        resistance_level: setTrackingValuesNumber.resistance_level,
        partial_reps: setTrackingValuesNumber.partial_reps,
        user_weight: setTrackingValuesNumber.user_weight,
      };

      if (isTemplate && workoutTemplate.id !== 0) {
        newSet.workout_template_id = workoutTemplate.id;
      }

      if (!isTemplate && workout.id !== 0) {
        newSet.workout_id = workout.id;
      }

      const setId: number = await InsertSetIntoDatabase(newSet);

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

  const deleteSet = async () => {
    if (
      operatingSet === undefined ||
      operationType !== "delete-set" ||
      operatingGroupedSet === undefined
    )
      return;

    const success = await DeleteSetWithId(operatingSet.id);

    if (!success) return;

    const groupedSetIndex = FindIndexInList(
      groupedSets,
      operatingGroupedSet.id
    );

    const updatedWorkoutNumbers: WorkoutNumbers = {
      ...workoutNumbers,
      numSets: workoutNumbers.numSets - 1,
    };

    const updatedSetList = DeleteItemFromList(
      groupedSets[groupedSetIndex].setList,
      operatingSet.id
    );

    if (updatedSetList.length === 0) {
      // Remove Exercise/Multiset from groupedSets if last Set in Exercise was deleted
      const updatedGroupedSets = DeleteItemFromList(
        groupedSets,
        operatingGroupedSet.id
      );

      setGroupedSets(updatedGroupedSets);
      updateExerciseOrder(updatedGroupedSets);

      updatedWorkoutNumbers.numExercises =
        GetNumberOfUniqueExercisesInGroupedSets(updatedGroupedSets);
    } else {
      const newGroupedSet = {
        ...operatingGroupedSet,
        setList: updatedSetList,
      };

      if (operatingGroupedSet.isMultiset && operatingGroupedSet.multiset) {
        operatingGroupedSet.multiset.setList = updatedSetList;

        const setListIdList = GenerateMultisetSetListIdList(
          operatingGroupedSet.multiset.set_order
        );

        let updatedSetListIdList = setListIdList.map((setList) =>
          DeleteIdFromList(setList, operatingSet.id)
        );

        // Remove empty setLists
        updatedSetListIdList = updatedSetListIdList.filter(
          (setList) => setList.length > 0
        );

        const { success, updatedMultiset } = await UpdateMultisetSetOrder(
          operatingGroupedSet.multiset,
          updatedSetListIdList
        );

        if (!success) return;

        const updatedIndexCutoffs =
          CreateMultisetIndexCutoffs(updatedSetListIdList);

        const setIndex: number = operatingGroupedSet.setList.findIndex(
          (obj) => obj.id === operatingSet.id
        );

        const updatedExerciseList = [...operatingGroupedSet.exerciseList];

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
    updateSetIndexInShownSetListComments(
      operatingGroupedSet.id,
      operatingSet.set_index ?? -1
    );

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingSet();

    toast.success(isTemplate ? "Set Removed" : "Set Deleted");
    deleteModal.onClose();

    if (
      completedSetsMap.has(operatingGroupedSet.id) &&
      operatingSet.is_completed === 1
    ) {
      // Lower the value for completedSetsMap key if deleted Set was completed
      const value = completedSetsMap.get(operatingGroupedSet.id);
      completedSetsMap.set(operatingGroupedSet.id, value! - 1);
    }

    if (!isTemplate) {
      if (operatingSet.id === activeSet?.id) {
        goToNextIncompleteSet(activeSet);
      } else if (operatingSet.is_completed === 0) {
        const updatedIncompleteSetIds = DeleteIdFromList(
          incompleteSetIds,
          operatingSet.id
        );

        setIncompleteSetIds(updatedIncompleteSetIds);
      }
    }
  };

  const updateSet = async () => {
    if (selectedExercise === undefined || operatingGroupedSet === undefined)
      return;

    if (operatingSetInputs.isSetTrackingValuesInvalid) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      operatingSetInputs.setTrackingValuesInput
    );

    const noteToInsert = ConvertEmptyStringToNull(operatingSet.note);

    const updatedSet: WorkoutSet = {
      ...operatingSet,
      exercise_id: selectedExercise.id,
      note: noteToInsert,
      exercise_name: selectedExercise.name,
      weight: setTrackingValuesNumber.weight,
      reps: setTrackingValuesNumber.reps,
      distance: setTrackingValuesNumber.distance,
      rir: setTrackingValuesNumber.rir,
      rpe: setTrackingValuesNumber.rpe,
      resistance_level: setTrackingValuesNumber.resistance_level,
      partial_reps: setTrackingValuesNumber.partial_reps,
      user_weight: setTrackingValuesNumber.user_weight,
    };

    const success = await UpdateSet(updatedSet);

    if (!success) return;

    const groupedSetId: string =
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
      setActiveSet(updatedSet);
      activeSetInputs.setTrackingValuesInputStrings(updatedSet);
    }
  };

  const updateExerciseOrder = async (
    setList: GroupedWorkoutSet[] = groupedSets
  ) => {
    if (isTemplate && workoutTemplate.id !== 0) {
      await UpdateExerciseOrder(setList, workoutTemplate.id, true);
    }

    if (!isTemplate && workout.id !== 0) {
      await UpdateExerciseOrder(setList, workout.id, false);
    }

    if (isExerciseBeingDragged) setIsExerciseBeingDragged(false);
  };

  const resetOperatingSet = () => {
    setOperationType("add");
    setSelectedExercise(undefined);
    setOperatingGroupedSet(undefined);
    setOperatingSet({
      ...defaultSet,
      weight_unit: userSettings!.default_unit_weight!,
      distance_unit: userSettings!.default_unit_distance!,
      user_weight_unit: userSettings!.default_unit_weight!,
    });
    operatingSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
  };

  const handleSaveSetButton = async (numSets: string, targetSet?: string) => {
    if (operationType === "add") {
      await addSetsToExercise(numSets);
    }
    if (operationType === "edit") {
      await updateSet();
    }
    if (operationType === "add-sets-to-multiset" && targetSet) {
      await addSetsToMultiset(numSets, targetSet);
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
    operatingSetInputs.setTrackingValuesInputStrings(set);

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
      exercise.formattedGroupString ?? ""
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

      updateActiveSetTrackingValues(newActiveSet, activeSet);
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
    if (key === "edit") {
      handleEditSet(set, index, exercise, groupedSet);
    } else if (key === "delete-set") {
      handleDeleteSet(set, groupedSet);
    } else if (key === "update-completed-set-time") {
      handleUpdateSetTimeCompleted(set, groupedSet);
    } else if (key === "change-exercise") {
      handleChangeExerciseMultiset(set, groupedSet, index, key);
    } else if (key === "reassign-exercise") {
      handleChangeExerciseMultiset(set, groupedSet, index, key);
    } else if (key === "unset-warmup") {
      handleChangeWarmupForSet(set, index, groupedSet, false);
    } else if (key === "set-warmup") {
      handleChangeWarmupForSet(set, index, groupedSet, true);
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
    multisetModal.onOpen();
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
    setOperatingSet(set);
    setOperatingGroupedSet(groupedSet);
    setOperationType("delete-set");

    deleteModal.onOpen();
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
    if (key === "reassign-exercise") {
      handleReassignExercise(groupedWorkoutSet);
    } else if (key === "change-exercise") {
      handleChangeExercise(groupedWorkoutSet);
    } else if (key === "delete-grouped_sets-sets") {
      handleDeleteExerciseSets(groupedWorkoutSet);
    } else if (key === "add-set-to-exercise") {
      handleAddSetToExercise(groupedWorkoutSet);
    } else if (key === "add-sets-to-multiset") {
      handleAddSetToMultiset(groupedWorkoutSet);
    } else if (key === "toggle-exercise-note") {
      handleToggleExerciseNote(groupedWorkoutSet);
    } else if (key === "edit-multiset") {
      handleEditMultiset(groupedWorkoutSet);
    } else if (key === "add-multiset") {
      handleAddMultisetToMultiset(groupedWorkoutSet);
    } else if (key === "fill-in-last-workout-set-values") {
      handleFillInLastWorkoutSetValues(groupedWorkoutSet);
    }
  };

  const handleAddSetToExercise = async (
    groupedWorkoutSet: GroupedWorkoutSet
  ) => {
    const exercise = groupedWorkoutSet.exerciseList[0];

    let newSet: WorkoutSet = {
      ...defaultSet,
      exercise_id: exercise.id,
      weight_unit: userSettings!.default_unit_weight!,
      distance_unit: userSettings!.default_unit_distance!,
      exercise_name: exercise.name,
      user_weight_unit: userSettings!.default_unit_weight!,
    };

    if (isTemplate && workoutTemplate.id !== 0) {
      newSet.workout_template_id = workoutTemplate.id;
    }

    if (!isTemplate && workout.id !== 0) {
      newSet.workout_id = workout.id;
    }

    newSet = AssignTrackingValuesIfCardio(
      newSet,
      exercise.formattedGroupString ?? ""
    );

    const setId: number = await InsertSetIntoDatabase(newSet);

    if (setId === 0) return;

    newSet = { ...newSet, id: setId };
    const newSets: WorkoutSet[] = [newSet];

    const groupedSetIndex = FindIndexInList(
      groupedSets,
      exercise.id.toString()
    );

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[groupedSetIndex].isExpanded = true;
      newList[groupedSetIndex].setList = [
        ...newList[groupedSetIndex].setList,
        ...newSets,
      ];
      return newList;
    });

    const updatedWorkoutNumbers: WorkoutNumbers = {
      ...workoutNumbers,
      numSets: workoutNumbers.numSets + 1,
    };

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingSet();
    toast.success("Set Added");
  };

  const handleDeleteExerciseSets = (groupedWorkoutSet: GroupedWorkoutSet) => {
    setOperationType("delete-grouped_sets-sets");
    setOperatingGroupedSet(groupedWorkoutSet);

    deleteModal.onOpen();
  };

  const deleteAllSetsForGroupedSet = async () => {
    if (
      operatingGroupedSet === undefined ||
      operationType !== "delete-grouped_sets-sets"
    )
      return;

    try {
      let statement = "";
      let id = 0;
      let exerciseId = operatingGroupedSet.exerciseList[0].id;

      if (isTemplate && workoutTemplate.id !== 0) {
        if (
          operatingGroupedSet.isMultiset &&
          operatingGroupedSet.multiset !== undefined
        ) {
          statement = `DELETE from sets WHERE multiset_id = $1
          AND workout_template_id = $2 
          AND is_template = 1`;
          exerciseId = operatingGroupedSet.multiset.id;
        } else {
          statement = `DELETE from sets WHERE exercise_id = $1 
          AND workout_template_id = $2 
          AND is_template = 1`;
        }

        id = workoutTemplate.id;
      }

      if (!isTemplate && workout.id !== 0) {
        if (
          operatingGroupedSet.isMultiset &&
          operatingGroupedSet.multiset !== undefined
        ) {
          statement = `DELETE from sets
                      WHERE multiset_id = $1 AND workout_id = $2`;
          exerciseId = operatingGroupedSet.multiset.id;
        } else {
          statement = `DELETE from sets 
          WHERE exercise_id = $1 AND workout_id = $2`;
        }

        id = workout.id;
      }

      if (id === 0) return;

      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(statement, [exerciseId, id]);

      const updatedGroupedSets = DeleteItemFromList(
        groupedSets,
        operatingGroupedSet.id
      );

      if (completedSetsMap.has(operatingGroupedSet.id)) {
        completedSetsMap.delete(operatingGroupedSet.id);
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
    let updatedSet: Set<number> = new Set<number>();
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
                      AND is_template = 1`;
          id = workoutTemplate.id;
        }

        if (!isTemplate && workout.id !== 0) {
          statement = `UPDATE sets SET exercise_id = $1 
                      WHERE exercise_id = $2 
                      AND workout_id = $3 
                      AND is_template = 0`;
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

    const updatedGroupedSets = reassignExerciseForMultisetGroupedSets(
      newExercise,
      oldExercise
    );

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
      const newCompletedSetsMap: Map<string, number> = new Map(
        completedSetsMap
      );

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
      multisetActions.handleChangeExercise(
        set,
        groupedSet.multiset,
        false,
        "reassign-exercise"
      );
      return;
    }

    setSelectedExercise(undefined);
    setOperationType("reassign-exercise");
    setOperatingGroupedSet(groupedSet);

    setModal.onOpen();
  };

  const clearSetInputValues = (isOperatingSet: boolean) => {
    if (isOperatingSet) {
      operatingSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
      setOperatingSet({
        ...operatingSet,
        time_in_seconds: 0,
      });
    } else if (activeSet !== undefined) {
      activeSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
      setActiveSet({
        ...activeSet,
        time_in_seconds: 0,
      });
    }
  };

  const saveActiveSet = async () => {
    if (
      activeSet === undefined ||
      workout.id === 0 ||
      activeGroupedSet === undefined
    )
      return;

    if (activeSetInputs.isSetTrackingValuesInvalid) return;

    const isUpdatingActiveSet = activeSet.is_completed === 1 ? true : false;

    const currentDateString = GetCurrentDateTimeISOString();

    const setTrackingValuesNumbers = ConvertSetInputValuesToNumbers(
      activeSetInputs.setTrackingValuesInput
    );

    const updatedSet: WorkoutSet = {
      ...activeSet,
      weight: setTrackingValuesNumbers.weight,
      reps: setTrackingValuesNumbers.reps,
      distance: setTrackingValuesNumbers.distance,
      rir: setTrackingValuesNumbers.rir,
      rpe: setTrackingValuesNumbers.rpe,
      resistance_level: setTrackingValuesNumbers.resistance_level,
      partial_reps: setTrackingValuesNumbers.partial_reps,
      user_weight: setTrackingValuesNumbers.user_weight,
      is_completed: 1,
      time_completed: currentDateString,
    };

    const success = await UpdateSet(updatedSet);

    if (!success) return;

    const groupedSetIndex = FindIndexInList(groupedSets, activeGroupedSet.id);

    const updatedSetList = UpdateItemInList(
      groupedSets[groupedSetIndex].setList,
      updatedSet
    );

    const completedSetsValue = completedSetsMap.get(activeGroupedSet.id) ?? 0;

    if (activeSet.is_completed === 0) {
      completedSetsMap.set(activeGroupedSet.id, completedSetsValue + 1);
    }

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[groupedSetIndex].setList = updatedSetList;
      return newList;
    });

    goToNextIncompleteSet(updatedSet, isUpdatingActiveSet);
    toast.success("Set Saved");
  };

  const handleTextInputModalButton = () => {
    if (isTemplate) {
      saveSetNote();
    } else {
      saveSetComment();
    }
  };

  const saveSetNote = async () => {
    if (operatingSet.id === 0 || operatingGroupedSet === undefined) return;

    const noteToInsert = ConvertEmptyStringToNull(setCommentInput);

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

    setSetCommentInput("");
    resetOperatingSet();
    toast.success("Note Saved");
    textInputModal.onClose();
  };

  const saveSetComment = async () => {
    if (operatingSet.id === 0 || operatingGroupedSet === undefined) return;

    const commentToInsert = ConvertEmptyStringToNull(setCommentInput);

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

    setSetCommentInput("");
    resetOperatingSet();
    toast.success("Comment Saved");
    textInputModal.onClose();
  };

  const handleToggleSetCommentButton = (
    set: WorkoutSet,
    index: number,
    groupedSet: GroupedWorkoutSet
  ) => {
    setOperatingSet({ ...set, set_index: index });
    setOperatingGroupedSet(groupedSet);

    if (isTemplate) {
      setSetCommentInput(set.note ?? "");
    } else {
      setSetCommentInput(set.comment ?? "");
    }

    textInputModal.onOpen();
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
      activeSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
      return;
    }

    const lastSetIndex: number = incompleteSetIds.findIndex(
      (id) => id === lastSet.id
    );

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
          updateActiveSetTrackingValues(newActiveSet, lastSet);
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

  const updateActiveSetTrackingValues = useCallback(
    (activeSet: WorkoutSet, lastSet: WorkoutSet | undefined) => {
      const activeSetInputValues: SetTrackingValuesInput = {
        weight:
          activeSet.weight > 0 && activeSet.is_tracking_weight
            ? activeSet.weight.toString()
            : "",
        reps:
          activeSet.reps > 0 && activeSet.is_tracking_reps
            ? activeSet.reps.toString()
            : "",
        rir:
          activeSet.rir > -1 && activeSet.is_tracking_rir
            ? activeSet.rir.toString()
            : "",
        rpe:
          activeSet.rpe > 0 && activeSet.is_tracking_rpe
            ? activeSet.rpe.toString()
            : "",
        distance:
          activeSet.distance > 0 && activeSet.is_tracking_distance
            ? activeSet.distance.toString()
            : "",
        resistance_level:
          activeSet.resistance_level > 0 &&
          activeSet.is_tracking_resistance_level
            ? activeSet.resistance_level.toString()
            : "",
        partial_reps:
          activeSet.partial_reps > 0 && activeSet.is_tracking_partial_reps
            ? activeSet.partial_reps.toString()
            : "",
        user_weight:
          activeSet.user_weight > 0 && activeSet.is_tracking_user_weight
            ? activeSet.user_weight.toString()
            : "",
      };

      if (
        lastSet !== undefined &&
        activeSet.exercise_id === lastSet.exercise_id
      ) {
        // If same exercise, keep input values from last set, unless it already has values set
        if (
          activeSet.is_tracking_weight === 1 &&
          activeSet.weight === 0 &&
          lastSet.weight > 0
        ) {
          activeSetInputValues.weight = lastSet.weight.toString();
        }
        if (
          activeSet.is_tracking_reps === 1 &&
          activeSet.reps === 0 &&
          lastSet.reps > 0
        ) {
          activeSetInputValues.reps = lastSet.reps.toString();
        }
        if (
          activeSet.is_tracking_rir === 1 &&
          activeSet.rir === -1 &&
          lastSet.rir > -1
        ) {
          activeSetInputValues.rir = lastSet.rir.toString();
        }
        if (
          activeSet.is_tracking_rpe === 1 &&
          activeSet.rpe === 0 &&
          lastSet.rpe > 0
        ) {
          activeSetInputValues.rpe = lastSet.rpe.toString();
        }
        if (
          activeSet.is_tracking_distance === 1 &&
          activeSet.distance === 0 &&
          lastSet.distance > 0
        ) {
          activeSetInputValues.distance = lastSet.distance.toString();
        }
        if (
          activeSet.is_tracking_resistance_level === 1 &&
          activeSet.resistance_level === 0 &&
          lastSet.resistance_level > 0
        ) {
          activeSetInputValues.resistance_level =
            lastSet.resistance_level.toString();
        }
        if (
          activeSet.is_tracking_partial_reps === 1 &&
          activeSet.partial_reps === 0 &&
          lastSet.partial_reps > 0
        ) {
          activeSetInputValues.partial_reps = lastSet.partial_reps.toString();
        }
        if (
          activeSet.is_tracking_user_weight === 1 &&
          activeSet.user_weight === 0 &&
          lastSet.user_weight > 0
        ) {
          activeSetInputValues.user_weight = lastSet.user_weight.toString();
        }
      }

      activeSetInputs.setSetTrackingValuesInput(activeSetInputValues);
    },
    // Including activeSetInputs in the dependency array causes constant re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const populateIncompleteSets = useCallback(
    (groupedSetList: GroupedWorkoutSet[]) => {
      const incompleteSetIdList: number[] = [];
      let firstSetIndex: number = -1;
      const newCompletedSetsMap: Map<string, number> = new Map();

      // Add Set ids of all incomplete Sets to incompleteSetIds list
      for (let i = 0; i < groupedSetList.length; i++) {
        const setList: WorkoutSet[] = groupedSetList[i].setList;
        let numCompletedSets: number = 0;
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
              updateActiveSetTrackingValues(newActiveSet, undefined);
            }
          } else {
            numCompletedSets += 1;
          }
        }
        newCompletedSetsMap.set(groupedSetList[i].id, numCompletedSets);
      }
      setIncompleteSetIds(incompleteSetIdList);
      setCompletedSetsMap(newCompletedSetsMap);
    },
    [updateActiveSetTrackingValues]
  );

  const handleActiveSetOptionSelection = (key: string) => {
    if (
      activeSet === undefined ||
      activeGroupedSet === undefined ||
      activeSet.set_index === undefined
    )
      return;

    if (key === "show-set-note" && activeSet.note) {
      const note: ActiveSetNote = {
        note: activeSet.note,
        note_type: "Set Note",
      };
      setActiveSetNote(note);
    } else if (
      key === "show-exercise-note" &&
      activeGroupedSet.exerciseList[activeSet.set_index] &&
      activeGroupedSet.exerciseList[activeSet.set_index].note
    ) {
      const note: ActiveSetNote = {
        note: activeGroupedSet.exerciseList[activeSet.set_index].note ?? "",
        note_type: "Exercise Note",
      };
      setActiveSetNote(note);
    } else if (key === "show-set-comment" && activeSet.comment) {
      const note: ActiveSetNote = {
        note: activeSet.comment,
        note_type: "Comment",
      };
      setActiveSetNote(note);
    } else if (key === "hide-note") {
      setActiveSetNote(undefined);
    }
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

  const handleAddMultisetButton = () => {
    if (operationType === "edit") {
      resetOperatingMultiset();
    }

    resetOperatingSet();

    multisetModal.onOpen();
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
      exercise.formattedGroupString ?? ""
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

  const createNewMultiset = async (numSets: string) => {
    if (operationType !== "add") return;

    if (!numSetsOptions.includes(numSets)) return;

    const noteToInsert = ConvertEmptyStringToNull(operatingMultiset.note);

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

    const numSetsToAdd: number = parseInt(numSets);

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
          operatingMultisetSet.exercise_id
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

    multisetModal.onClose();
    toast.success("Multiset Created");
  };

  const addSetsToMultiset = async (numSets: string, targetSet: string) => {
    if (
      selectedExercise === undefined ||
      operatingGroupedSet === undefined ||
      operatingGroupedSet.multiset === undefined ||
      operatingGroupedSet.multiset.setListIndexCutoffs === undefined
    )
      return;

    if (!numSetsOptions.includes(numSets)) return;

    const targetSetNum = parseInt(targetSet);

    if (
      isNaN(targetSetNum) ||
      targetSetNum > operatingGroupedSet.multiset.setListIndexCutoffs.size
    )
      return;

    if (operatingSetInputs.isSetTrackingValuesInvalid) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      operatingSetInputs.setTrackingValuesInput
    );

    const noteToInsert = ConvertEmptyStringToNull(operatingSet.note);

    const newSets: WorkoutSet[] = [];

    const numSetsToAdd = parseInt(numSets);

    const newSetListIdList = GenerateMultisetSetListIdList(
      operatingGroupedSet.multiset.set_order
    );

    for (let i = 0; i < numSetsToAdd; i++) {
      const newSet: WorkoutSet = {
        ...operatingSet,
        exercise_id: selectedExercise.id,
        note: noteToInsert,
        exercise_name: selectedExercise.name,
        weight: setTrackingValuesNumber.weight,
        reps: setTrackingValuesNumber.reps,
        distance: setTrackingValuesNumber.distance,
        rir: setTrackingValuesNumber.rir,
        rpe: setTrackingValuesNumber.rpe,
        resistance_level: setTrackingValuesNumber.resistance_level,
        partial_reps: setTrackingValuesNumber.partial_reps,
        user_weight: setTrackingValuesNumber.user_weight,
        multiset_id: operatingGroupedSet.multiset.id,
      };

      if (isTemplate && workoutTemplate.id !== 0) {
        newSet.workout_template_id = workoutTemplate.id;
      }

      if (!isTemplate && workout.id !== 0) {
        newSet.workout_id = workout.id;
      }

      const setId: number = await InsertSetIntoDatabase(newSet);

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

  const handleSaveMultisetButton = async (numSets?: string) => {
    if (operationType === "add" && numSets) {
      await createNewMultiset(numSets);
    }
    if (operationType === "edit") {
      await updateMultiset();
    }
  };

  const updateMultiset = async () => {
    if (!operatingMultiset.isEditedInModal) {
      resetOperatingMultiset();
      multisetModal.onClose();
      return;
    }

    if (
      operatingMultiset.id === 0 ||
      operatingMultiset.setListIndexCutoffs === undefined ||
      operatingGroupedSet === undefined ||
      operatingGroupedSet.multiset === undefined
    )
      return;

    const noteToInsert = ConvertEmptyStringToNull(operatingMultiset.note);

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
        operatingMultiset.setList[i].exercise_id
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

    multisetModal.onClose();
    toast.success("Multiset Updated");
  };

  const handleEditMultiset = async (groupedSet: GroupedWorkoutSet) => {
    if (!groupedSet.multiset) return;

    resetOperatingSet();

    setOperationType("edit");
    setOperatingGroupedSet(groupedSet);
    multisetActions.clearMultiset("base", { ...groupedSet.multiset });
    multisetActions.setUneditedMultiset({ ...groupedSet.multiset });
    multisetModal.onOpen();
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

    if (!numSetsOptions.includes(numSets)) return;

    const newMultiset = { ...multiset, is_template: 0 };

    const multisetId = await InsertMultisetIntoDatabase(newMultiset);

    if (multisetId === 0) return;

    newMultiset.id = multisetId;

    const templateSetListIds = GenerateMultisetSetOrderList(multiset.set_order);

    const numSetsToAdd: number = parseInt(numSets);

    const { setListIdList, setListList, exerciseListList } =
      await AddNewSetsToMultiset(
        numSetsToAdd,
        templateSetListIds,
        isTemplate,
        multisetId,
        isTemplate ? undefined : workout,
        isTemplate ? workoutTemplate : undefined
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

    multisetModal.onClose();
    toast.success("Multiset Added");
  };

  const handleAddMultisetToMultiset = (groupedSet: GroupedWorkoutSet) => {
    if (!groupedSet.multiset) return;

    resetOperatingSet();

    setOperationType("add-multiset-to-multiset");
    setOperatingGroupedSet(groupedSet);
    setOperatingMultiset(groupedSet.multiset);
    multisetActions.setModalPage("multiset-list");
    multisetModal.onOpen();
  };

  const addMultisetToMultiset = async (
    selectedMultiset: Multiset,
    numSets: string
  ) => {
    if (
      operatingGroupedSet === undefined ||
      operatingGroupedSet.multiset === undefined ||
      !numSetsOptions.includes(numSets)
    )
      return;

    const existingSetListIds = GenerateMultisetSetListIdList(
      operatingGroupedSet.multiset.set_order
    );

    const newSetListIds = GenerateMultisetSetOrderList(
      selectedMultiset.set_order
    );

    const numSetsToAdd: number = parseInt(numSets);

    const multisetId = operatingGroupedSet.multiset.id;

    const { setListIdList, setListList, exerciseListList } =
      await AddNewSetsToMultiset(
        numSetsToAdd,
        newSetListIds,
        isTemplate,
        multisetId,
        isTemplate ? undefined : workout,
        isTemplate ? workoutTemplate : undefined
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

    multisetModal.onClose();
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

  const populateUserWeightValues = (weight?: number, weight_unit?: string) => {
    if (
      activeSet === undefined ||
      (userWeight.id < 1 && weight === undefined && weight_unit === undefined)
    )
      return;

    const updatedSet = {
      ...activeSet,
      user_weight: weight ?? userWeight.weight,
      user_weight_unit: weight_unit ?? userWeight.weight_unit,
    };

    setActiveSet(updatedSet);
    activeSetInputs.setTrackingValuesInputStrings(updatedSet);

    setIsUserWeightOlderThanOneWeek(
      IsDateStringOlderThanOneWeek(userWeight.date)
    );
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
        updateActiveSetTrackingValues(updatedSet, undefined);
      }
    }

    const updatedGroupedSets = UpdateItemInList(groupedSets, updatedGroupedSet);

    setGroupedSets(updatedGroupedSets);
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
    clearSetInputValues,
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
    operatingSetInputs,
    shownSetListComments,
    setIsExerciseBeingDragged,
    workoutTemplate,
    setWorkoutTemplate,
    workout,
    setWorkout,
    activeSet,
    setActiveSet,
    saveActiveSet,
    goToNextIncompleteSet,
    updateActiveSetTrackingValues,
    populateIncompleteSets,
    handleActiveSetOptionSelection,
    incompleteSetIds,
    setIncompleteSetIds,
    activeSetInputs,
    isActiveSetExpanded,
    setIsActiveSetExpanded,
    activeGroupedSet,
    activeSetNote,
    setActiveSetNote,
    handleEditSet,
    completedSetsMap,
    timeInputModal,
    updateSetTimeCompleted,
    workoutNumbers,
    setWorkoutNumbers,
    multisetActions,
    exerciseList,
    multisetModal,
    operatingMultiset,
    setOperatingMultiset,
    handleAddMultisetButton,
    handleSaveMultisetButton,
    handleClickExerciseMultiset,
    handleClickMultiset,
    textInputModal,
    setCommentInput,
    setSetCommentInput,
    handleTextInputModalButton,
    handleToggleSetCommentButton,
    numMultisetSets,
    userWeight,
    setUserWeight,
    populateUserWeightValues,
    isUserWeightOlderThanOneWeek,
    setIsUserWeightOlderThanOneWeek,
    calculationString,
    presetsList,
    calculationModal,
  };
};

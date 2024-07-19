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
  GetSetFromId,
  GetExerciseFromId,
  UpdateMultisetSetOrder,
  GetNumberOfUniqueExercisesInGroupedSets,
  AssignTrackingValuesIfCardio,
} from "../helpers";
import {
  useDefaultSet,
  useNumSetsOptions,
  useSetTrackingInputs,
  useDefaultSetInputValues,
  useMultisetActions,
  useDefaultMultiset,
  useExerciseList,
} from "../hooks";

type OperationType =
  | "add"
  | "edit"
  | "delete-set"
  | "change-exercise"
  | "reassign-exercise"
  | "delete-grouped_sets-sets"
  | "update-completed-set-time"
  | "add-sets-to-multiset";

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
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false);
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
  const [activeSetComment, setActiveSetComment] = useState<string>("");

  const numSetsOptions = useNumSetsOptions();

  const defaultSet = useDefaultSet(isTemplate);

  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(defaultSet);

  const defaultMultiset = useDefaultMultiset();

  const [operatingMultiset, setOperatingMultiset] =
    useState<Multiset>(defaultMultiset);

  const setModal = useDisclosure();
  const deleteModal = useDisclosure();
  const timeInputModal = useDisclosure();
  const multisetModal = useDisclosure();
  const textInputModal = useDisclosure();

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
    defaultPage: "multiset-list",
  });

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
        }));
      } catch (error) {
        console.log(error);
      }
    };

    loadUserSettings();
  }, []);

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

    const groupedSetIndex: number = groupedSets.findIndex(
      (obj) => obj.id === selectedExercise.id.toString()
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
        showExerciseNote: true,
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

    const groupedSetIndex: number = groupedSets.findIndex(
      (obj) => obj.id === operatingGroupedSet.id
    );

    const updatedWorkoutNumbers: WorkoutNumbers = {
      ...workoutNumbers,
      numSets: workoutNumbers.numSets - 1,
    };

    const updatedSetList: WorkoutSet[] = groupedSets[
      groupedSetIndex
    ].setList.filter((item) => item.id !== operatingSet.id);

    if (updatedSetList.length === 0) {
      // Remove Exercise from groupedSets if last Set in Exercise was deleted
      const updatedGroupedSets: GroupedWorkoutSet[] = groupedSets.filter(
        (_, index) => index !== groupedSetIndex
      );

      setGroupedSets(updatedGroupedSets);
      updateExerciseOrder(updatedGroupedSets);

      updatedWorkoutNumbers.numExercises =
        GetNumberOfUniqueExercisesInGroupedSets(updatedGroupedSets);
    } else {
      setGroupedSets((prev) => {
        const newList = [...prev];
        newList[groupedSetIndex].setList = updatedSetList;
        return newList;
      });
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
        const updatedIncompleteSetIds = incompleteSetIds.filter(
          (id) => id !== operatingSet.id
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
    };

    const success = await UpdateSet(updatedSet);

    if (!success) return;

    const groupedSetId: string =
      operatingSet.multiset_id > 0
        ? `m${operatingSet.multiset_id}`
        : operatingSet.exercise_id.toString();

    const groupedSetIndex: number = groupedSets.findIndex(
      (obj) => obj.id === groupedSetId
    );

    const updatedSetList: WorkoutSet[] = groupedSets[
      groupedSetIndex
    ].setList.map((item) => (item.id === operatingSet.id ? updatedSet : item));

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

    if (!isTemplate && activeSet?.id === updatedSet.id) {
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
    });
    operatingSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
  };

  const handleSaveSetButton = async (numSets: string) => {
    if (operationType === "add") {
      await addSetsToExercise(numSets);
    }
    if (operationType === "edit") {
      await updateSet();
    }
    if (operationType === "add-sets-to-multiset") {
      await addSetToMultiset(numSets);
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
      reassignExercise(exercise);
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
    }
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

  const handleExerciseOptionSelection = (
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

    const groupedSetIndex: number = groupedSets.findIndex(
      (obj) => obj.id === exercise.id.toString()
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

      const updatedGroupedSets: GroupedWorkoutSet[] = groupedSets.filter(
        (item) => item.id !== operatingGroupedSet.id
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
      showExerciseNote: !groupedWorkoutSet.showExerciseNote,
    };

    setGroupedSets((prev) =>
      prev.map((item) =>
        item.id === groupedWorkoutSet.id ? updatedGroupedSet : item
      )
    );
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

  const handleExerciseAccordionClick = (groupedSet: GroupedWorkoutSet) => {
    if (isExerciseBeingDragged) return;

    const updatedGroupedSet: GroupedWorkoutSet = {
      ...groupedSet,
      isExpanded: !groupedSet.isExpanded,
    };

    setGroupedSets((prev) =>
      prev.map((item) => (item.id === groupedSet.id ? updatedGroupedSet : item))
    );
  };

  const reassignExercise = async (newExercise: Exercise) => {
    if (operatingGroupedSet === undefined || operatingGroupedSet.isMultiset)
      return;

    const oldExercise = operatingGroupedSet.exerciseList[0];

    // Do nothing if trying to reassign the same Exercise
    if (oldExercise.id === newExercise.id) {
      resetOperatingSet();
      setModal.onClose();
      return;
    }

    const oldGroupedSetIndex: number = groupedSets.findIndex(
      (obj) => obj.id === oldExercise.id.toString()
    );

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

    const newGroupedWorkoutSet: GroupedWorkoutSet = {
      ...operatingGroupedSet,
      id: newExercise.id.toString(),
      exerciseList: [newExercise],
    };

    newGroupedWorkoutSet.setList.forEach((item) => {
      item.exercise_id = newExercise.id;
      item.exercise_name = newExercise.name;
    });

    const newGroupedSetIndex: number = groupedSets.findIndex(
      (obj) => obj.id === newExercise.id.toString()
    );

    if (completedSetsMap.has(operatingGroupedSet.id)) {
      // Change key to match new exercise id
      const newCompletedSetsMap: Map<string, number> = new Map(
        completedSetsMap
      );

      const value = completedSetsMap.get(operatingGroupedSet.id);
      newCompletedSetsMap.delete(operatingGroupedSet.id);
      newCompletedSetsMap.set(newExercise.id.toString(), value!);

      setCompletedSetsMap(newCompletedSetsMap);
    }

    if (newGroupedSetIndex === -1) {
      // Create new GroupedWorkoutSet if exercise_id does not exist in groupedSets
      const newGroupedSets = [...groupedSets];
      newGroupedSets[oldGroupedSetIndex] = newGroupedWorkoutSet;

      setGroupedSets(newGroupedSets);
      updateExerciseOrder(newGroupedSets);
    } else {
      // Add old Sets to groupedSets' existing Exercise's Set List
      const newGroupedSets = [...groupedSets];

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

    resetOperatingSet();

    setModal.onClose();

    toast.success(
      operationType === "reassign-exercise"
        ? "Exercise Reassigned"
        : "Exercise Changed"
    );

    if (isTemplate) return;

    if (activeSet !== undefined && activeSet.exercise_id === oldExercise.id) {
      setActiveSet({
        ...activeSet,
        exercise_id: newExercise.id,
        exercise_name: newExercise.name,
      });
    }

    if (
      activeGroupedSet !== undefined &&
      activeGroupedSet.id === oldExercise.id.toString()
    ) {
      setActiveGroupedSet(newGroupedWorkoutSet);
    }
  };

  const handleReassignExercise = (groupedWorkoutSet: GroupedWorkoutSet) => {
    setSelectedExercise(undefined);
    setOperationType("reassign-exercise");
    setOperatingGroupedSet(groupedWorkoutSet);

    setModal.onOpen();
  };

  const clearSetInputValues = (isOperatingSet: boolean) => {
    if (isOperatingSet) {
      operatingSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
      setOperatingSet({
        ...operatingSet,
        time_in_seconds: 0,
      });
    } else if (!isTemplate && activeSet !== undefined) {
      activeSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
      setActiveSet({
        ...activeSet,
        time_in_seconds: 0,
      });
    }
  };

  const saveActiveSet = async () => {
    // TODO: FIX FOR MULTISETS
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

    const commentToInsert = ConvertEmptyStringToNull(activeSet.comment);

    const updatedSet: WorkoutSet = {
      ...activeSet,
      weight: setTrackingValuesNumbers.weight,
      reps: setTrackingValuesNumbers.reps,
      distance: setTrackingValuesNumbers.distance,
      rir: setTrackingValuesNumbers.rir,
      rpe: setTrackingValuesNumbers.rpe,
      resistance_level: setTrackingValuesNumbers.resistance_level,
      partial_reps: setTrackingValuesNumbers.partial_reps,
      is_completed: 1,
      time_completed: currentDateString,
      comment: commentToInsert,
    };

    const success = await UpdateSet(updatedSet);

    if (!success) return;

    // TODO: RENAME
    const exerciseIndex: number = groupedSets.findIndex(
      (obj) => obj.exerciseList[0].id === activeSet.exercise_id
    );

    const updatedSetList: WorkoutSet[] = groupedSets[exerciseIndex].setList.map(
      (item) => (item.id === activeSet.id ? updatedSet : item)
    );

    const completedSetsValue = completedSetsMap.get(activeGroupedSet.id) ?? 0;

    if (activeSet.is_completed === 0) {
      completedSetsMap.set(activeGroupedSet.id, completedSetsValue + 1);
    }

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[exerciseIndex].setList = updatedSetList;
      return newList;
    });

    // Close shownSetListComments for Set if comment was deleted
    if (updatedSet.comment === null) {
      updateSetIndexInShownSetListComments(
        activeGroupedSet.id,
        activeSet.set_index ?? -1
      );
    }

    goToNextIncompleteSet(updatedSet, isUpdatingActiveSet);
    setShowCommentInput(false);
    toast.success("Set Saved");
  };

  const saveActiveSetComment = () => {};

  const handleActiveSetCommentButton = () => {};

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

    const updatedIncompleteSetIds = incompleteSetIds.filter(
      (id) => id !== lastSet.id
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
      }

      activeSetInputs.setSetTrackingValuesInput(activeSetInputValues);
    },
    // Including activeSetInputs in the dependency array causes constant re-renders
    [] // eslint-disable-line react-hooks/exhaustive-deps
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
    // TODO: FIX FOR MULTISETS
    if (activeSet === undefined || activeGroupedSet === undefined) return;

    if (key === "show-set-note" && activeSet.note) {
      const note: ActiveSetNote = {
        note: activeSet.note,
        note_type: "Set Note",
      };
      setActiveSetNote(note);
    } else if (
      key === "show-exercise-note" &&
      activeGroupedSet.exerciseList[0].note
    ) {
      const note: ActiveSetNote = {
        note: activeGroupedSet.exerciseList[0].note,
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

    const groupedSetIndex: number = groupedSets.findIndex(
      (obj) => obj.id === operatingGroupedSet.id
    );

    const updatedSetList: WorkoutSet[] = groupedSets[
      groupedSetIndex
    ].setList.map((item) => (item.id === operatingSet.id ? updatedSet : item));

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
    resetOperatingSet();

    multisetModal.onOpen();
  };

  const resetOperatingMultiset = () => {
    multisetActions.setModalPage("multiset-list");
    multisetActions.setNewMultisetSetIndex(0);
    multisetActions.setNewExerciseList([]);
    setOperatingMultiset(defaultMultiset);
  };

  const handleAddSetToMultiset = async (
    groupedWorkoutSet: GroupedWorkoutSet
  ) => {
    resetOperatingSet();

    setOperationType("add-sets-to-multiset");
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

    setOperatingMultiset((prev) => ({ ...prev, setList: newSetList }));

    multisetActions.setNewExerciseList((prev) => [...prev, exercise]);
    multisetActions.setNewMultisetSetIndex((prev) => prev - 1);

    multisetActions.setModalPage("base");
  };

  const createMultiset = async (numSets: string) => {
    if (operationType !== "add") return;

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

    const templateSetListIdOrder: number[] = [];
    const operatingSetListIdOrder: number[] = [];

    for (let i = 0; i < operatingMultiset.setList.length; i++) {
      templateMultiset.setList[i].multiset_id = templateMultisetId;
      templateMultiset.setList[i].workout_id = 0;
      templateMultiset.setList[i].workout_template_id = 0;

      operatingMultiset.setList[i].multiset_id = operatingMultisetId;
      operatingMultiset.setList[i].is_template = isTemplate ? 1 : 0;

      if (isTemplate && workoutTemplate.id !== 0) {
        operatingMultiset.setList[i].workout_template_id = workoutTemplate.id;
      }

      if (!isTemplate && workout.id !== 0) {
        operatingMultiset.setList[i].workout_id = workout.id;
      }

      const templateMultisetSetId = await InsertSetIntoDatabase(
        templateMultiset.setList[i]
      );

      const operatingMultisetSetId = await InsertSetIntoDatabase(
        operatingMultiset.setList[i]
      );

      if (templateMultisetSetId === 0 || operatingMultisetSetId === 0) return;

      templateMultiset.setList[i].id = templateMultisetSetId;
      operatingMultiset.setList[i].id = operatingMultisetSetId;

      templateSetListIdOrder.push(templateMultisetSetId);
      operatingSetListIdOrder.push(operatingMultisetSetId);
    }

    const templateMultisetUpdate = await UpdateMultisetSetOrder(
      templateMultiset,
      [templateSetListIdOrder]
    );

    const operatingMultisetUpdate = await UpdateMultisetSetOrder(
      operatingMultiset,
      [operatingSetListIdOrder]
    );

    if (!templateMultisetUpdate.success || !operatingMultisetUpdate.success)
      return;

    const updatedTemplateMultiset = templateMultisetUpdate.updatedMultiset;

    const updatedOperatingMultiset = operatingMultisetUpdate.updatedMultiset;

    // Add Template Multiset to Multiset list in useMultisetActions
    multisetActions.setMultisets([
      ...multisetActions.multisets,
      updatedTemplateMultiset,
    ]);

    const newGroupedSet: GroupedWorkoutSet = {
      id: `m${updatedOperatingMultiset.id}`,
      exerciseList: multisetActions.newExerciseList,
      setList: updatedOperatingMultiset.setList,
      isExpanded: false,
      isMultiset: true,
      multiset: updatedOperatingMultiset,
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

  const addSetToMultiset = async (numSets: string) => {
    // TODO: REFACTOR WITH addSetToNewMultiset
    if (
      selectedExercise === undefined ||
      operatingGroupedSet === undefined ||
      operatingGroupedSet.multiset === undefined
    )
      return;

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
    }

    const groupedSetIndex: number = groupedSets.findIndex(
      (obj) => obj.id === operatingGroupedSet.id
    );

    // TODO: SAVE NEW MULTISET ORDER
    const updatedGroupedSets = [...groupedSets];
    updatedGroupedSets[groupedSetIndex].setList = [
      ...updatedGroupedSets[groupedSetIndex].setList,
      ...newSets,
    ];
    setGroupedSets(updatedGroupedSets);

    const updatedWorkoutNumbers: WorkoutNumbers = {
      numSets: workoutNumbers.numSets + numSetsToAdd,
      numExercises: GetNumberOfUniqueExercisesInGroupedSets(updatedGroupedSets),
    };

    if (!isTemplate) populateIncompleteSets(updatedGroupedSets);

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingSet();

    setModal.onClose();
    toast.success(`Set${numSetsToAdd > 1 ? "s" : ""} Added To Multiset`);
  };

  const handleSaveMultisetButton = async (numSets?: string) => {
    if (operationType === "add" && numSets) {
      await createMultiset(numSets);
    }
    if (operationType === "edit") {
      //TODO: ADD
    }
  };

  const updateMultisetSet = () => {
    // TODO: IMPLEMENT
  };

  const handleClickExerciseMultiset = (exercise: Exercise) => {
    addSetToNewMultiset(exercise);
  };

  const handleClickMultiset = async (multiset: Multiset, numSets: string) => {
    if (operationType !== "add") return;

    if (!numSetsOptions.includes(numSets)) return;

    const newMultiset = { ...multiset, is_template: 0 };

    const multisetId = await InsertMultisetIntoDatabase(newMultiset);

    if (multisetId === 0) return;

    newMultiset.id = multisetId;

    const templateSetListIds = GenerateMultisetSetOrderList(multiset.set_order);

    const numSetsToAdd: number = parseInt(numSets);

    const setListIdList: number[][] = Array.from(
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

    for (let i = 0; i < templateSetListIds.length; i++) {
      const set = await GetSetFromId(templateSetListIds[i]);

      if (set === undefined) continue;

      const exercise = await GetExerciseFromId(set.exercise_id);

      set.is_template = isTemplate ? 1 : 0;
      set.multiset_id = multisetId;

      if (isTemplate && workoutTemplate.id !== 0) {
        set.workout_template_id = workoutTemplate.id;
      }

      if (!isTemplate && workout.id !== 0) {
        set.workout_id = workout.id;
      }

      for (let j = 0; j < numSetsToAdd; j++) {
        const setId = await InsertSetIntoDatabase(set);

        if (setId === 0) return;

        set.id = setId;

        setListIdList[j].push(setId);
        setListList[j].push(set);
        exerciseListList[j].push(exercise);
      }
    }

    const indexCutoffs = new Map<number, number>();

    Array.from({ length: numSetsToAdd }).forEach((_, i) => {
      const startIndex = i * templateSetListIds.length;
      indexCutoffs.set(startIndex, i + 1);
    });

    newMultiset.setList = setListList.flat();

    const newExerciseList = exerciseListList.flat();

    const { success, updatedMultiset } = await UpdateMultisetSetOrder(
      newMultiset,
      setListIdList
    );

    if (!success) return;

    const newGroupedSet: GroupedWorkoutSet = {
      id: `m${updatedMultiset.id}`,
      exerciseList: newExerciseList,
      setList: updatedMultiset.setList,
      isExpanded: false,
      isMultiset: true,
      multiset: updatedMultiset,
      setListIndexCutoffs: indexCutoffs,
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

  return {
    updateExerciseOrder,
    handleSaveSetButton,
    handleAddSetButton,
    handleClickExercise,
    handleClickSet,
    handleSetOptionSelection,
    handleExerciseOptionSelection,
    handleDeleteModalButton,
    updateShownSetListComments,
    handleExerciseAccordionClick,
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
    showCommentInput,
    setShowCommentInput,
    activeSetNote,
    setActiveSetNote,
    handleEditSet,
    completedSetsMap,
    timeInputModal,
    updateSetTimeCompleted,
    workoutNumbers,
    multisetActions,
    exerciseList,
    multisetModal,
    operatingMultiset,
    setOperatingMultiset,
    handleAddMultisetButton,
    handleSaveMultisetButton,
    updateMultisetSet,
    handleClickExerciseMultiset,
    handleClickMultiset,
    textInputModal,
    activeSetComment,
    setActiveSetComment,
    saveActiveSetComment,
    handleActiveSetCommentButton,
  };
};

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
} from "../helpers";
import {
  useDefaultSet,
  useNumSetsOptions,
  useSetTrackingInputs,
  useDefaultSetInputValues,
} from "../hooks";

type OperationType =
  | "add"
  | "edit"
  | "delete-set"
  | "change-exercise"
  | "reassign-exercise"
  | "delete-exercise-sets"
  | "update-completed-set-time";

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
  const [completedSetsMap, setCompletedSetsMap] = useState<Map<number, number>>(
    new Map()
  );
  const [activeSetNote, setActiveSetNote] = useState<
    ActiveSetNote | undefined
  >();
  const [isActiveSetExpanded, setIsActiveSetExpanded] =
    useState<boolean>(false);
  const [activeGroupedSet, setActiveGroupedSet] = useState<GroupedWorkoutSet>();

  const numSetsOptions = useNumSetsOptions();

  const defaultNewSet = useDefaultSet(isTemplate);

  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(defaultNewSet);

  const setModal = useDisclosure();
  const deleteModal = useDisclosure();
  const timeInputModal = useDisclosure();

  const defaultSetInputValues = useDefaultSetInputValues();

  const operatingSetInputs = useSetTrackingInputs();
  const activeSetInputs = useSetTrackingInputs();

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

  const addSet = async (numSets: string) => {
    if (selectedExercise === undefined) return;

    if (!numSetsOptions.includes(numSets)) return;

    if (operatingSetInputs.isSetTrackingValuesInvalid) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      operatingSetInputs.setTrackingValuesInput
    );

    try {
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

        if (isTemplate && workoutTemplate !== undefined) {
          newSet.workout_template_id = workoutTemplate.id;
        }

        if (!isTemplate && workout.id !== 0) {
          newSet.workout_id = workout.id;
        }

        const setId: number = await InsertSetIntoDatabase(newSet);

        if (setId === 0) return;

        newSets.push({ ...newSet, id: setId });
      }

      const exerciseIndex: number = groupedSets.findIndex(
        (obj) => obj.exercise.id === selectedExercise.id
      );

      const updatedWorkoutNumbers: WorkoutNumbers = {
        ...workoutNumbers,
        numSets: workoutNumbers.numSets + numSetsToAdd,
      };

      if (exerciseIndex === -1) {
        // Create new GroupedWorkoutSet if exercise_id does not exist in groupedSets
        const newGroupedWorkoutSet: GroupedWorkoutSet = {
          exercise: selectedExercise,
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

        updatedWorkoutNumbers.numExercises = workoutNumbers.numExercises + 1;

        if (!isTemplate) populateIncompleteSets(newGroupedSets);
      } else {
        // Add new Sets to groupedSets' existing Exercise's Set List
        const newList = [...groupedSets];
        newList[exerciseIndex].setList = [
          ...newList[exerciseIndex].setList,
          ...newSets,
        ];
        setGroupedSets(newList);

        if (!isTemplate) populateIncompleteSets(newList);
      }

      setWorkoutNumbers(updatedWorkoutNumbers);

      resetOperatingSet();

      setModal.onClose();
      toast.success("Set Added");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteSet = async () => {
    if (operatingSet === undefined || operationType !== "delete-set") return;

    const success = await DeleteSetWithId(operatingSet.id);

    if (!success) return;

    const exerciseIndex: number = groupedSets.findIndex(
      (obj) => obj.exercise.id === operatingSet.exercise_id
    );

    const updatedWorkoutNumbers: WorkoutNumbers = {
      ...workoutNumbers,
      numSets: workoutNumbers.numSets - 1,
    };

    const updatedSetList: WorkoutSet[] = groupedSets[
      exerciseIndex
    ].setList.filter((item) => item.id !== operatingSet.id);

    if (updatedSetList.length === 0) {
      // Remove Exercise from groupedSets if last Set in Exercise was deleted
      const updatedGroupedSets: GroupedWorkoutSet[] = groupedSets.filter(
        (_, index) => index !== exerciseIndex
      );

      setGroupedSets(updatedGroupedSets);
      updateExerciseOrder(updatedGroupedSets);

      updatedWorkoutNumbers.numExercises = workoutNumbers.numExercises - 1;
    } else {
      setGroupedSets((prev) => {
        const newList = [...prev];
        newList[exerciseIndex].setList = updatedSetList;
        return newList;
      });
    }

    // Close shownSetListComments for Set if deleted Set note was shown
    updateSetIndexInShownSetListComments(
      operatingSet.exercise_id,
      operatingSet.set_index ?? -1
    );

    setWorkoutNumbers(updatedWorkoutNumbers);

    resetOperatingSet();

    toast.success(isTemplate ? "Set Removed" : "Set Deleted");
    deleteModal.onClose();

    if (
      completedSetsMap.has(operatingSet.exercise_id) &&
      operatingSet.is_completed === 1
    ) {
      // Lower the value for completedSetsMap key if deleted Set was completed
      const value = completedSetsMap.get(operatingSet.exercise_id);
      completedSetsMap.set(operatingSet.exercise_id, value! - 1);
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
    if (selectedExercise === undefined) return;

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

    const exerciseIndex: number = groupedSets.findIndex(
      (obj) => obj.exercise.id === operatingSet.exercise_id
    );

    const updatedSetList: WorkoutSet[] = groupedSets[exerciseIndex].setList.map(
      (item) => (item.id === operatingSet.id ? updatedSet : item)
    );

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[exerciseIndex].setList = updatedSetList;
      return newList;
    });

    // Close shownSetListComments for Set if note was deleted
    if (updatedSet.note === null) {
      updateSetIndexInShownSetListComments(
        operatingSet.exercise_id,
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
    if (isTemplate && workoutTemplate !== undefined) {
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
      ...defaultNewSet,
      weight_unit: userSettings!.default_unit_weight!,
      distance_unit: userSettings!.default_unit_distance!,
    });
    operatingSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
  };

  const handleSaveSetButton = async (numSets: string) => {
    if (operationType === "add") {
      await addSet(numSets);
    }
    if (operationType === "edit") {
      await updateSet();
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
    exercise: Exercise
  ) => {
    setOperatingSet({ ...set, set_index: index });
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

    if (exercise.formattedGroupString === "Cardio") {
      setOperatingSet((prev) => ({
        ...prev,
        is_tracking_weight: 0,
        is_tracking_reps: 0,
        is_tracking_distance: 1,
        is_tracking_time: 1,
      }));
    } else {
      setOperatingSet((prev) => ({
        ...prev,
        is_tracking_weight: 1,
        is_tracking_reps: 1,
        is_tracking_distance: 0,
        is_tracking_time: 0,
      }));
    }
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
    exercise: Exercise
  ) => {
    if (isTemplate) {
      handleEditSet(set, index, exercise);
    } else {
      const newActiveSet = { ...set, set_index: index };
      setActiveSet(newActiveSet);

      const groupedSet = groupedSets.find(
        (obj) => obj.exercise.id === exercise.id
      );
      setActiveGroupedSet(groupedSet);

      updateActiveSetTrackingValues(newActiveSet, activeSet);
      setIsActiveSetExpanded(true);
    }
  };

  const handleSetOptionSelection = (
    key: string,
    set: WorkoutSet,
    index: number,
    exercise: Exercise
  ) => {
    if (key === "edit") {
      handleEditSet(set, index, exercise);
    } else if (key === "delete-set") {
      handleDeleteSet(set);
    } else if (key === "update-completed-set-time") {
      handleUpdateSetTimeCompleted(set);
    }
  };

  const handleUpdateSetTimeCompleted = (set: WorkoutSet) => {
    setOperatingSet(set);
    setOperationType("update-completed-set-time");

    timeInputModal.onOpen();
  };

  const handleDeleteSet = (set: WorkoutSet) => {
    setOperatingSet(set);
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
    } else if (key === "delete-exercise-sets") {
      handleDeleteExerciseSets(groupedWorkoutSet);
    } else if (key === "add-set-to-exercise") {
      handleAddSetToExercise(groupedWorkoutSet);
    } else if (key === "toggle-exercise-note") {
      handleToggleExerciseNote(groupedWorkoutSet);
    }
  };

  const handleAddSetToExercise = async (
    groupedWorkoutSet: GroupedWorkoutSet
  ) => {
    const exercise = groupedWorkoutSet.exercise;

    let newSet: WorkoutSet = {
      ...defaultNewSet,
      exercise_id: exercise.id,
      weight_unit: userSettings!.default_unit_weight!,
      distance_unit: userSettings!.default_unit_distance!,
      exercise_name: exercise.name,
    };

    if (isTemplate && workoutTemplate !== undefined) {
      newSet.workout_template_id = workoutTemplate.id;
    }

    if (!isTemplate && workout.id !== 0) {
      newSet.workout_id = workout.id;
    }

    if (exercise.formattedGroupString === "Cardio") {
      newSet = {
        ...newSet,
        is_tracking_weight: 0,
        is_tracking_reps: 0,
        is_tracking_distance: 1,
        is_tracking_time: 1,
      };
    } else {
      newSet = {
        ...newSet,
        is_tracking_weight: 1,
        is_tracking_reps: 1,
        is_tracking_distance: 0,
        is_tracking_time: 0,
      };
    }

    const setId: number = await InsertSetIntoDatabase(newSet);

    if (setId === 0) return;

    newSet = { ...newSet, id: setId };
    const newSets: WorkoutSet[] = [newSet];

    const exerciseIndex: number = groupedSets.findIndex(
      (obj) => obj.exercise.id === exercise.id
    );

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[exerciseIndex].isExpanded = true;
      newList[exerciseIndex].setList = [
        ...newList[exerciseIndex].setList,
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
    setOperationType("delete-exercise-sets");
    setOperatingGroupedSet(groupedWorkoutSet);

    deleteModal.onOpen();
  };

  const deleteAllSetsForExerciseId = async () => {
    if (
      operatingGroupedSet === undefined ||
      operationType !== "delete-exercise-sets"
    )
      return;

    try {
      let statement = "";
      let id = 0;

      if (isTemplate && workoutTemplate !== undefined) {
        statement = `DELETE from sets WHERE exercise_id = $1 
                    AND workout_template_id = $2 
                    AND is_template = 1`;
        id = workoutTemplate.id;
      }

      if (!isTemplate && workout.id !== 0) {
        statement = `DELETE from sets 
                    WHERE exercise_id = $1 AND workout_id = $2`;
        id = workout.id;
      }

      if (id === 0) return;

      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.execute(statement, [
        operatingGroupedSet.exercise.id,
        id,
      ]);

      const updatedSetList: GroupedWorkoutSet[] = groupedSets.filter(
        (item) => item.exercise.id !== operatingGroupedSet.exercise.id
      );

      if (completedSetsMap.has(operatingGroupedSet.exercise.id)) {
        completedSetsMap.delete(operatingGroupedSet.exercise.id);
      }

      setGroupedSets(updatedSetList);

      updateExerciseOrder(updatedSetList);

      const updatedWorkoutNumbers: WorkoutNumbers = {
        ...workoutNumbers,
        numSets: workoutNumbers.numSets - result.rowsAffected,
        numExercises: workoutNumbers.numExercises - 1,
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
    if (operationType === "delete-exercise-sets") {
      deleteAllSetsForExerciseId();
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
        item.exercise.id === groupedWorkoutSet.exercise.id
          ? updatedGroupedSet
          : item
      )
    );
  };

  const updateShownSetListComments = (exerciseId: number, index: number) => {
    let updatedSet: Set<number> = new Set<number>();
    if (shownSetListComments[exerciseId]) {
      // If shownSetListComments HAS key for exerciseId
      updatedSet = new Set(shownSetListComments[exerciseId]);

      if (shownSetListComments[exerciseId].has(index)) {
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
      [exerciseId]: updatedSet,
    }));
  };

  const updateSetIndexInShownSetListComments = (
    exerciseId: number,
    setIndex: number
  ) => {
    if (
      shownSetListComments[exerciseId] &&
      shownSetListComments[exerciseId].has(setIndex)
    ) {
      updateShownSetListComments(exerciseId, setIndex);
    }
  };

  const handleExerciseAccordionClick = (groupedSet: GroupedWorkoutSet) => {
    if (isExerciseBeingDragged) return;

    const updatedGroupedSet: GroupedWorkoutSet = {
      ...groupedSet,
      isExpanded: !groupedSet.isExpanded,
    };

    setGroupedSets((prev) =>
      prev.map((item) =>
        item.exercise.id === groupedSet.exercise.id ? updatedGroupedSet : item
      )
    );
  };

  const reassignExercise = async (newExercise: Exercise) => {
    if (operatingGroupedSet === undefined) return;

    // Do nothing if trying to reassign the same Exercise
    if (operatingGroupedSet.exercise.id === newExercise.id) {
      resetOperatingSet();
      setModal.onClose();
      return;
    }

    const oldExerciseIndex: number = groupedSets.findIndex(
      (obj) => obj.exercise.id === operatingGroupedSet.exercise.id
    );

    if (operationType === "reassign-exercise") {
      // Reassign ALL sets with old exercise_id to new exercise_id
      await ReassignExerciseIdForSets(
        operatingGroupedSet.exercise.id,
        newExercise.id
      );
    } else if (operationType === "change-exercise") {
      // Just change the sets with this specific workout_template_id
      try {
        let statement = "";
        let id = 0;

        if (isTemplate && workoutTemplate !== undefined) {
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

        db.execute(statement, [operatingGroupedSet.exercise.id, id]);

        await db.execute(statement, [
          newExercise.id,
          operatingGroupedSet.exercise.id,
          id,
        ]);
      } catch (error) {
        console.log(error);
        return;
      }
    } else return;

    const newGroupedWorkoutSet: GroupedWorkoutSet = {
      ...operatingGroupedSet,
      exercise: newExercise,
    };

    newGroupedWorkoutSet.setList.forEach((item) => {
      item.exercise_id = newExercise.id;
    });

    const newExerciseIndex: number = groupedSets.findIndex(
      (obj) => obj.exercise.id === newExercise.id
    );

    if (completedSetsMap.has(operatingGroupedSet.exercise.id)) {
      // Change key to match new exercise id
      const value = completedSetsMap.get(operatingGroupedSet.exercise.id);
      completedSetsMap.delete(operatingGroupedSet.exercise.id);
      completedSetsMap.set(newExercise.id, value!);
    }

    if (newExerciseIndex === -1) {
      // Create new GroupedWorkoutSet if exercise_id does not exist in groupedSets
      const newGroupedSets = [...groupedSets];
      newGroupedSets[oldExerciseIndex] = newGroupedWorkoutSet;

      setGroupedSets(newGroupedSets);
      updateExerciseOrder(newGroupedSets);
    } else {
      // Add old Sets to groupedSets' existing Exercise's Set List
      const newGroupedSets = [...groupedSets];

      newGroupedSets[newExerciseIndex].setList = [
        ...newGroupedSets[newExerciseIndex].setList,
        ...newGroupedWorkoutSet.setList,
      ];

      newGroupedSets.splice(oldExerciseIndex, 1);

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

    if (
      !isTemplate &&
      activeSet !== undefined &&
      activeGroupedSet !== undefined &&
      activeSet.exercise_id === operatingGroupedSet.exercise.id
    ) {
      setActiveSet({
        ...activeSet,
        exercise_id: newExercise.id,
        exercise_name: newExercise.name,
      });
      setActiveGroupedSet({ ...activeGroupedSet, exercise: newExercise });
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
    if (activeSet === undefined || workout.id === 0) return;

    if (activeSetInputs.isSetTrackingValuesInvalid) return;

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

    const exerciseIndex: number = groupedSets.findIndex(
      (obj) => obj.exercise.id === activeSet.exercise_id
    );

    const updatedSetList: WorkoutSet[] = groupedSets[exerciseIndex].setList.map(
      (item) => (item.id === activeSet.id ? updatedSet : item)
    );

    const completedSetsValue = completedSetsMap.get(activeSet.exercise_id) ?? 0;
    completedSetsMap.set(activeSet.exercise_id, completedSetsValue + 1);

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[exerciseIndex].setList = updatedSetList;
      return newList;
    });

    // Close shownSetListComments for Set if comment was deleted
    if (updatedSet.comment === null) {
      updateSetIndexInShownSetListComments(
        activeSet.exercise_id,
        activeSet.set_index ?? -1
      );
    }

    goToNextIncompleteSet(updatedSet);
    setShowCommentInput(false);
    toast.success("Set Saved");
  };

  const goToNextIncompleteSet = (lastSet: WorkoutSet) => {
    if (incompleteSetIds.length < 2) {
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
          activeSet.rir > 0 && activeSet.is_tracking_rir
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
          activeSet.rir === 0 &&
          lastSet.rir > 0
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
      const newCompletedSetsMap: Map<number, number> = new Map();

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
        newCompletedSetsMap.set(
          groupedSetList[i].exercise.id,
          numCompletedSets
        );
      }
      setIncompleteSetIds(incompleteSetIdList);
      setCompletedSetsMap(newCompletedSetsMap);
    },
    [updateActiveSetTrackingValues]
  );

  const handleActiveSetOptionSelection = (key: string) => {
    if (activeSet === undefined || activeGroupedSet === undefined) return;

    if (key === "show-set-note" && activeSet.note) {
      const note: ActiveSetNote = {
        note: activeSet.note,
        note_type: "Set Note",
      };
      setActiveSetNote(note);
    } else if (key === "show-exercise-note" && activeGroupedSet.exercise.note) {
      const note: ActiveSetNote = {
        note: activeGroupedSet.exercise.note,
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
      operatingSet.time_completed === null
    )
      return;

    const updatedSet: WorkoutSet = {
      ...operatingSet,
      time_completed: newDateString,
    };

    const success = await UpdateSet(updatedSet);

    if (!success) return;

    const exerciseIndex: number = groupedSets.findIndex(
      (obj) => obj.exercise.id === operatingSet.exercise_id
    );

    const updatedSetList: WorkoutSet[] = groupedSets[exerciseIndex].setList.map(
      (item) => (item.id === operatingSet.id ? updatedSet : item)
    );

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[exerciseIndex].setList = updatedSetList;
      return newList;
    });

    if (activeSet?.id === updatedSet.id) {
      setActiveSet(updatedSet);
    }

    resetOperatingSet();

    toast.success("Time Updated");
    timeInputModal.onClose();
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
  };
};

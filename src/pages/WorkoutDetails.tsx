import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Workout, WorkoutSet, Exercise, GroupedWorkoutSet } from "../typings";
import {
  LoadingSpinner,
  WorkoutExerciseList,
  DeleteModal,
  SetModal,
  ActiveSet,
  WorkoutModal,
} from "../components";
import Database from "tauri-plugin-sql-api";
import {
  CreateSetsFromWorkoutTemplate,
  GetUserSettings,
  ConvertSetInputValuesToNumbers,
  FormatDateString,
  CreateGroupedWorkoutSetListByExerciseId,
  GenerateExerciseOrderString,
  InsertSetIntoDatabase,
  UpdateSet,
  ConvertEmptyStringToNull,
  UpdateExerciseOrder,
  DeleteSetWithId,
  ReassignExerciseIdForSets,
} from "../helpers";
import { Button, useDisclosure } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import {
  useSetListOptionsMenu,
  useWorkoutActions,
  useNumSetsOptions,
} from "../hooks";
import { VerticalMenuIcon } from "../assets";

type WorkoutTemplateNote = {
  note: string | null;
};

export default function WorkoutDetails() {
  const { id } = useParams();

  const setListOptionsMenu = useSetListOptionsMenu(false);

  const workoutModal = useDisclosure();

  const [workoutDate, setWorkoutDate] = useState<string>("");
  const [workoutNote, setWorkoutNote] = useState<string>("");
  const [workoutTemplateNote, setWorkoutTemplateNote] = useState<string | null>(
    null
  );

  // TODO: DELETE
  const numSetsOptions = useNumSetsOptions();

  const {
    // updateExerciseOrder,
    // handleSaveSetButton,
    // handleAddSetButton,
    // handleClickExercise,
    // handleClickSet,
    // handleSetOptionSelection,
    // handleExerciseOptionSelection,
    // handleDeleteModalButton,
    // updateShownSetListComments,
    // handleExerciseAccordionClick,
    // handleReassignExercise,
    // clearSetInputValues,
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
  } = useWorkoutActions();

  const initialized = useRef(false);

  const updateWorkout = useCallback(async (workout: Workout) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute(
        `UPDATE workouts SET 
        workout_template_id = $1, date = $2, exercise_order = $3, 
        note = $4, is_loaded = $5, rating = $6
        WHERE id = $7`,
        [
          workout.workout_template_id,
          workout.date,
          workout.exercise_order,
          workout.note,
          workout.is_loaded,
          workout.rating,
          workout.id,
        ]
      );
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Workout[]>(
          "SELECT * FROM workouts WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const workout: Workout = result[0];

        if (workout.is_loaded === 1) {
          const setList = await db.select<WorkoutSet[]>(
            `SELECT sets.*, 
            COALESCE(exercises.name, 'Unknown Exercise') AS exercise_name
            FROM sets LEFT JOIN 
            exercises ON sets.exercise_id = exercises.id 
            WHERE workout_id = $1 AND is_template = 0`,
            [id]
          );

          const groupedSetList: GroupedWorkoutSet[] =
            await CreateGroupedWorkoutSetListByExerciseId(
              setList,
              workout.exercise_order
            );

          for (let i = 0; i < groupedSetList.length; i++) {
            groupedSetList[i].showExerciseNote = true;
          }

          setWorkoutNote(workout.note === null ? "" : workout.note);
          setGroupedSets(groupedSetList);

          populateIncompleteSets(groupedSetList);
        } else {
          // Stop useEffect running twice in dev
          if (!initialized.current) {
            initialized.current = true;
          } else return;

          if (workout.workout_template_id !== 0) {
            const groupedSetList = await CreateSetsFromWorkoutTemplate(
              workout.id,
              workout.workout_template_id
            );

            const exerciseOrder: string =
              GenerateExerciseOrderString(groupedSetList);
            workout.exercise_order = exerciseOrder;

            setGroupedSets(groupedSetList);

            populateIncompleteSets(groupedSetList);
          }

          workout.is_loaded = 1;

          await updateWorkout(workout);
        }

        const formattedDate: string = FormatDateString(workout.date);

        if (workout.workout_template_id !== 0) {
          await getWorkoutTemplateNote(workout.workout_template_id);
        }

        setWorkout(workout);
        setWorkoutDate(formattedDate);
      } catch (error) {
        console.log(error);
      }
    };

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

    const getWorkoutTemplateNote = async (workoutTemplateId: number) => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutTemplateNote[]>(
          "SELECT note FROM workout_templates WHERE id = $1",
          [workoutTemplateId]
        );

        const note = result[0].note;

        if (note) setWorkoutTemplateNote(note);
      } catch (error) {
        console.log(error);
      }
    };

    loadWorkout();
    loadUserSettings();
  }, [
    id,
    updateWorkout,
    populateIncompleteSets,
    setGroupedSets,
    setOperatingSet,
    setUserSettings,
    setWorkout,
  ]);

  const addSet = async (numSets: string) => {
    if (selectedExercise === undefined || workout === undefined) return;

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
          workout_id: workout.id,
          note: noteToInsert,
          exercise_name: selectedExercise.name,
          weight: setTrackingValuesNumber.weight,
          reps: setTrackingValuesNumber.reps,
          distance: setTrackingValuesNumber.distance,
          rir: setTrackingValuesNumber.rir,
          rpe: setTrackingValuesNumber.rpe,
          resistance_level: setTrackingValuesNumber.resistance_level,
        };

        const setId: number = await InsertSetIntoDatabase(newSet);

        if (setId === 0) return;

        newSets.push({ ...newSet, id: setId });
      }

      const exerciseIndex: number = groupedSets.findIndex(
        (obj) => obj.exercise.id === selectedExercise.id
      );

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

        populateIncompleteSets(newGroupedSets);
      } else {
        // Add new Sets to groupedSets' existing Exercise's Set List
        const newList = [...groupedSets];
        newList[exerciseIndex].setList = [
          ...newList[exerciseIndex].setList,
          ...newSets,
        ];
        setGroupedSets(newList);
        populateIncompleteSets(newList);
      }

      resetSetToDefault();

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

    resetSetToDefault();

    toast.success("Set Deleted");
    deleteModal.onClose();

    if (operatingSet.id === activeSet?.id) {
      goToNextIncompleteSet(activeSet);
    } else if (operatingSet.is_completed === 0) {
      const updatedIncompleteSetIds = incompleteSetIds.filter(
        (id) => id !== operatingSet.id
      );
      setIncompleteSetIds(updatedIncompleteSetIds);
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

    // Close ShownSetListComments for Set if note was deleted
    if (updatedSet.note === null) {
      updateSetIndexInShownSetListComments(
        operatingSet.exercise_id,
        operatingSet.set_index ?? -1
      );
    }

    resetSetToDefault();

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
    if (workout === undefined) return;

    await UpdateExerciseOrder(setList, workout.id, false);

    if (isExerciseBeingDragged) setIsExerciseBeingDragged(false);
  };

  const resetSetToDefault = () => {
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
      resetSetToDefault();
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
    const newActiveSet = { ...set, set_index: index };
    setActiveSet(newActiveSet);

    const groupedSet = groupedSets.find(
      (obj) => obj.exercise.id === exercise.id
    );
    setActiveGroupedSet(groupedSet);

    updateActiveSetTrackingValues(newActiveSet, activeSet);
    setIsActiveSetExpanded(true);
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
    }
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
    if (workout === undefined) return;

    const exercise = groupedWorkoutSet.exercise;

    let newSet: WorkoutSet = {
      ...defaultNewSet,
      exercise_id: exercise.id,
      workout_id: workout.id,
      weight_unit: userSettings!.default_unit_weight!,
      distance_unit: userSettings!.default_unit_distance!,
      exercise_name: exercise.name,
    };

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

    resetSetToDefault();
    toast.success("Set Added");
  };

  const handleDeleteExerciseSets = (groupedWorkoutSet: GroupedWorkoutSet) => {
    setOperationType("delete-exercise-sets");
    setOperatingGroupedSet(groupedWorkoutSet);

    deleteModal.onOpen();
  };

  const deleteAllSetsForExerciseId = async () => {
    if (
      workout === undefined ||
      operatingGroupedSet === undefined ||
      operationType !== "delete-exercise-sets"
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute(
        `DELETE from sets 
         WHERE exercise_id = $1 AND workout_id = $2`,
        [operatingGroupedSet.exercise.id, workout.id]
      );

      const updatedSetList: GroupedWorkoutSet[] = groupedSets.filter(
        (item) => item.exercise.id !== operatingGroupedSet.exercise.id
      );

      setGroupedSets(updatedSetList);

      updateExerciseOrder(updatedSetList);

      resetSetToDefault();

      deleteModal.onClose();
      toast.success("Sets Deleted");
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
    if (operatingGroupedSet === undefined || workout === undefined) return;

    // Do nothing if trying to reassign the same Exercise
    if (operatingGroupedSet.exercise.id === newExercise.id) {
      resetSetToDefault();
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
      // Just change the sets with this specific workout_id
      try {
        const db = await Database.load(import.meta.env.VITE_DB);
        await db.execute(
          `UPDATE sets SET exercise_id = $1 
          WHERE exercise_id = $2 AND workout_id = $3 AND is_template = 0`,
          [newExercise.id, operatingGroupedSet.exercise.id, workout.id]
        );
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

      setGroupedSets(newGroupedSets);
      updateExerciseOrder(newGroupedSets);
    }

    resetSetToDefault();

    setModal.onClose();
    const toastMsg: string =
      operationType === "reassign-exercise"
        ? "Exercise Reassigned"
        : "Exercise Changed";
    toast.success(toastMsg);

    if (
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
    } else {
      if (activeSet === undefined) return;

      activeSetInputs.setSetTrackingValuesInput(defaultSetInputValues);
      setActiveSet({
        ...activeSet,
        time_in_seconds: 0,
      });
    }
  };

  const handleWorkoutModalSaveButton = async () => {
    if (workout === undefined) return;

    const noteToInsert = ConvertEmptyStringToNull(workoutNote);

    const updatedWorkout: Workout = { ...workout, note: noteToInsert };

    await updateWorkout(updatedWorkout);
    setWorkout(updatedWorkout);

    toast.success("Workout Details Updated");
    workoutModal.onClose();
  };

  if (workout === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <WorkoutModal
        workoutModal={workoutModal}
        workout={workout}
        setWorkout={setWorkout}
        workoutNote={workoutNote}
        setWorkoutNote={setWorkoutNote}
        workoutTemplateNote={workoutTemplateNote}
        buttonAction={handleWorkoutModalSaveButton}
      />
      <DeleteModal
        deleteModal={deleteModal}
        header={`Delete Set${
          operationType === "delete-exercise-sets" ? "s" : ""
        }`}
        body={
          <p className="break-words">
            {operationType === "delete-exercise-sets"
              ? `Are you sure you want to delete all ${operatingGroupedSet?.exercise.name} sets from Workout?`
              : `Are you sure you want to delete ${operatingSet.exercise_name} set?`}
          </p>
        }
        deleteButtonAction={handleDeleteModalButton}
      />
      <SetModal
        setModal={setModal}
        selectedExercise={selectedExercise}
        setSelectedExercise={setSelectedExercise}
        handleClickExercise={handleClickExercise}
        operationType={operationType}
        operatingSet={operatingSet}
        setOperatingSet={setOperatingSet}
        setTrackingValuesInput={operatingSetInputs.setTrackingValuesInput}
        setSetTrackingValuesInput={operatingSetInputs.setSetTrackingValuesInput}
        setInputsValidityMap={operatingSetInputs.setInputsValidityMap}
        isSetTrackingValuesInvalid={
          operatingSetInputs.isSetTrackingValuesInvalid
        }
        handleSaveSetButton={handleSaveSetButton}
        setIsTimeInputInvalid={operatingSetInputs.setIsTimeInputInvalid}
        defaultTimeInput={userSettings!.default_time_input!}
        time_input_behavior_hhmmss={userSettings!.time_input_behavior_hhmmss}
        time_input_behavior_mmss={userSettings!.time_input_behavior_mmss}
        clearSetInputValues={clearSetInputValues}
      />
      <div className="flex flex-col">
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex flex-col justify-center items-center gap-0.5">
            <div className="flex items-center gap-0.5">
              <h1 className="text-2xl font-semibold">{workoutDate}</h1>
              <Button
                isIconOnly
                className="z-1"
                size="sm"
                variant="light"
                onPress={() => workoutModal.onOpen()}
              >
                <VerticalMenuIcon size={18} color={"#606060"} />
              </Button>
            </div>
            {workout.note !== null && (
              <h3 className="text-xl font-semibold text-stone-400">
                {workout.note}
              </h3>
            )}
          </div>
        </div>
        <div className="mb-[4.5rem]">
          <WorkoutExerciseList
            groupedSets={groupedSets}
            setGroupedSets={setGroupedSets}
            updateExerciseOrder={updateExerciseOrder}
            handleExerciseAccordionClick={handleExerciseAccordionClick}
            handleExerciseOptionSelection={handleExerciseOptionSelection}
            handleClickSet={handleClickSet}
            handleSetOptionSelection={handleSetOptionSelection}
            updateShownSetListComments={updateShownSetListComments}
            shownSetListComments={shownSetListComments}
            setListOptionsMenu={setListOptionsMenu}
            handleAddSetButton={handleAddSetButton}
            setIsExerciseBeingDragged={setIsExerciseBeingDragged}
            handleReassignExercise={handleReassignExercise}
            isTemplate={false}
            activeSetId={activeSet?.id}
          />
        </div>
        <ActiveSet
          activeSet={activeSet}
          setActiveSet={setActiveSet}
          isActiveSetExpanded={isActiveSetExpanded}
          setIsActiveSetExpanded={setIsActiveSetExpanded}
          userSettings={userSettings!}
          activeGroupedSet={activeGroupedSet}
          handleReassignExercise={handleReassignExercise}
          handleActiveSetOptionSelection={handleActiveSetOptionSelection}
          showCommentInput={showCommentInput}
          setShowCommentInput={setShowCommentInput}
          activeSetNote={activeSetNote}
          setActiveSetNote={setActiveSetNote}
          handleClickSet={handleClickSet}
          handleSetOptionSelection={handleSetOptionSelection}
          updateShownSetListComments={updateShownSetListComments}
          shownSetListComments={shownSetListComments}
          setListOptionsMenu={setListOptionsMenu}
          activeSetInputs={activeSetInputs}
          handleEditSet={handleEditSet}
          clearSetInputValues={clearSetInputValues}
          saveActiveSet={saveActiveSet}
        />
      </div>
    </>
  );
}

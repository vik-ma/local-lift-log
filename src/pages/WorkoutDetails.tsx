import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Workout,
  WorkoutSet,
  UserSettings,
  Exercise,
  SetTrackingValuesInput,
  SetWorkoutSetAction,
  GroupedWorkoutSet,
  SetListNotes,
} from "../typings";
import {
  LoadingSpinner,
  WeightUnitDropdown,
  DistanceUnitDropdown,
  TimeInput,
  WorkoutRatingDropdown,
  WorkoutExerciseList,
  DeleteModal,
  SetModal,
} from "../components";
import Database from "tauri-plugin-sql-api";
import { NotFound } from ".";
import {
  CreateSetsFromWorkoutTemplate,
  GetUserSettings,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove10,
  ConvertSetInputValuesToNumbers,
  FormatDateString,
  ConvertDateStringToTimeString,
  CreateGroupedWorkoutSetListByExerciseId,
  GenerateExerciseOrderString,
  InsertSetIntoDatabase,
  UpdateSet,
  ConvertEmptyStringToNull,
  UpdateExerciseOrder,
  DeleteSetWithId,
  ReassignExerciseIdForSets,
} from "../helpers";
import {
  Button,
  useDisclosure,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import {
  CommentIcon,
  VerticalMenuIcon,
  ChevronIcon,
  MinimizeIcon,
} from "../assets";
import {
  useNumSetsOptions,
  useDefaultSet,
  useSetListOptionsMenu,
  useSetTrackingInputs,
  useDefaultSetInputValues,
} from "../hooks";

type OperationType =
  | "add"
  | "edit"
  | "delete-set"
  | "change-exercise"
  | "reassign-exercise"
  | "delete-exercise-sets";

type ActiveSetNote = {
  note: string;
  note_type: "Set Note" | "Exercise Note" | "Comment";
};

export default function WorkoutDetails() {
  const { id } = useParams();
  const [workout, setWorkout] = useState<Workout>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const numSetsOptions = useNumSetsOptions();
  const setListOptionsMenu = useSetListOptionsMenu(false);
  const defaultNewSet = useDefaultSet(false);

  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(defaultNewSet);

  const {
    isSetDefaultValuesInvalid,
    setInputsValidityMap,
    setTrackingValuesInput,
    setSetTrackingValuesInput,
    setIsTimeInputInvalid,
    setDefaultValuesInputStrings,
  } = useSetTrackingInputs();

  const defaultSetInputValues = useDefaultSetInputValues();

  const setModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [workoutDate, setWorkoutDate] = useState<string>("");
  const [workoutNote, setWorkoutNote] = useState<string>("");
  const [activeSet, setActiveSet] = useState<WorkoutSet>();
  const [isActiveSetTimeInputInvalid, setIsActiveSetTimeInputInvalid] =
    useState<boolean>(false);
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false);
  const [showWorkoutNoteInput, setShowWorkoutNoteInput] =
    useState<boolean>(false);
  const [incompleteSetIds, setIncompleteSetIds] = useState<number[]>([]);
  const [activeSetNote, setActiveSetNote] = useState<
    ActiveSetNote | undefined
  >();
  const [isActiveSetExpanded, setIsActiveSetExpanded] =
    useState<boolean>(false);
  const [activeGroupedSet, setActiveGroupedSet] = useState<GroupedWorkoutSet>();

  const initialized = useRef(false);

  const [activeSetTrackingValuesInput, setActiveSetTrackingValuesInput] =
    useState<SetTrackingValuesInput>(defaultSetInputValues);

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
      }

      setActiveSetTrackingValuesInput(activeSetInputValues);
    },
    []
  );

  const populateIncompleteSets = useCallback(
    (groupedSetList: GroupedWorkoutSet[]) => {
      const incompleteSetIdList: number[] = [];
      let firstSetIndex: number = -1;

      // Add Set ids of all incomplete Sets to incompleteSetIds list
      for (let i = 0; i < groupedSetList.length; i++) {
        const setList: WorkoutSet[] = groupedSetList[i].setList;
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
          }
        }
      }
      setIncompleteSetIds(incompleteSetIdList);
    },
    [updateActiveSetTrackingValues]
  );

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
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    loadWorkout();
    loadUserSettings();
  }, [id, updateWorkout, populateIncompleteSets]);

  const addSet = async (numSets: string) => {
    if (selectedExercise === undefined || workout === undefined) return;

    if (!numSetsOptions.includes(numSets)) return;

    if (isSetDefaultValuesInvalid) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      setTrackingValuesInput
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

    if (isSetDefaultValuesInvalid) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      setTrackingValuesInput
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
    setSetTrackingValuesInput(defaultSetInputValues);
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
    setDefaultValuesInputStrings(set);

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

  const isWeightInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(activeSetTrackingValuesInput.weight);
  }, [activeSetTrackingValuesInput.weight]);

  const isRepsInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(activeSetTrackingValuesInput.reps);
  }, [activeSetTrackingValuesInput.reps]);

  const isDistanceInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(activeSetTrackingValuesInput.distance);
  }, [activeSetTrackingValuesInput.distance]);

  const isRirInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(activeSetTrackingValuesInput.rir);
  }, [activeSetTrackingValuesInput.rir]);

  const isRpeInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOrAbove10(activeSetTrackingValuesInput.rpe);
  }, [activeSetTrackingValuesInput.rpe]);

  const isResistanceLevelInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(activeSetTrackingValuesInput.resistance_level);
  }, [activeSetTrackingValuesInput.resistance_level]);

  const isSetTrackingInputsInvalid = useMemo(() => {
    if (isWeightInputInvalid) return true;
    if (isRepsInputInvalid) return true;
    if (isDistanceInputInvalid) return true;
    if (isActiveSetTimeInputInvalid) return true;
    if (isRirInputInvalid) return true;
    if (isRpeInputInvalid) return true;
    if (isResistanceLevelInputInvalid) return true;
    return false;
  }, [
    isWeightInputInvalid,
    isRepsInputInvalid,
    isDistanceInputInvalid,
    isActiveSetTimeInputInvalid,
    isRirInputInvalid,
    isRpeInputInvalid,
    isResistanceLevelInputInvalid,
  ]);

  const saveActiveSet = async () => {
    if (activeSet === undefined || workout === undefined) return;

    if (isSetTrackingInputsInvalid) return;

    const currentDate = new Date().toString();

    const setTrackingValuesNumbers = ConvertSetInputValuesToNumbers(
      activeSetTrackingValuesInput
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
      is_completed: 1,
      time_completed: currentDate,
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
      setActiveSetTrackingValuesInput(defaultSetInputValues);
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

  const handleSaveNoteButton = async () => {
    if (workout === undefined) return;

    const noteToInsert = ConvertEmptyStringToNull(workoutNote);

    const updatedWorkout: Workout = { ...workout, note: noteToInsert };

    await updateWorkout(updatedWorkout);
    setWorkout(updatedWorkout);
  };

  if (workout === undefined) return NotFound();

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
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
        setTrackingValuesInput={setTrackingValuesInput}
        setSetTrackingValuesInput={setSetTrackingValuesInput}
        setInputsValidityMap={setInputsValidityMap}
        isSetDefaultValuesInvalid={isSetDefaultValuesInvalid}
        handleSaveSetButton={handleSaveSetButton}
        setIsTimeInputInvalid={setIsTimeInputInvalid}
        defaultTimeInput={userSettings!.default_time_input!}
        time_input_behavior_hhmmss={userSettings!.time_input_behavior_hhmmss}
        time_input_behavior_mmss={userSettings!.time_input_behavior_mmss}
      />
      <div className="flex flex-col">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-4 mb-20">
              <div className="flex justify-center items-center gap-5">
                <h1 className="text-2xl font-semibold">{workoutDate}</h1>
              </div>
              <div className="flex justify-center items-center gap-5">
                <Button
                  color="success"
                  variant="flat"
                  onClick={() => setShowWorkoutNoteInput(!showWorkoutNoteInput)}
                >
                  Set Workout Note
                </Button>
                <WorkoutRatingDropdown
                  rating={workout.rating}
                  workout_id={workout.id}
                />
              </div>
              {showWorkoutNoteInput && (
                <div className="flex flex-row justify-between gap-2 items-center">
                  <Input
                    value={workoutNote}
                    label="Workout Note"
                    variant="faded"
                    size="sm"
                    onValueChange={(value) => setWorkoutNote(value)}
                    isClearable
                  />
                  <Button color="success" onPress={handleSaveNoteButton}>
                    Save
                  </Button>
                </div>
              )}
            </div>
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
            />
            <div>
              {activeSet !== undefined && (
                <div
                  className={
                    isActiveSetExpanded
                      ? "fixed bottom-0 top-16 w-[400px] rounded-lg bg-white border-3 border-yellow-300 active-set-animation-expand"
                      : "fixed bottom-0 h-20 w-[400px] rounded-lg bg-white border-3 border-yellow-300 active-set-animation-shrink"
                  }
                >
                  <div className="flex flex-col h-full">
                    <button
                      className="flex h-[4.5rem] w-full cursor-pointer rounded hover:bg-amber-50"
                      onClick={() =>
                        setIsActiveSetExpanded(!isActiveSetExpanded)
                      }
                    >
                      <div className="flex justify-between w-full px-3 py-2 items-center">
                        <div className="flex flex-col items-start">
                          <div className="flex gap-1.5 text-2xl font-semibold">
                            <span className="text-yellow-500 max-w-[21rem] truncate">
                              {activeSet.exercise_name}{" "}
                            </span>
                            {activeSet.is_warmup === 1 && (
                              <span className="text-lime-300">(Warmup)</span>
                            )}
                          </div>
                          <div className="flex gap-1.5 text-lg font-medium justify-between w-80">
                            <span className="text-stone-500">
                              Set {activeSet.set_index! + 1}
                            </span>
                            {userSettings?.show_timestamp_on_completed_set ===
                              1 &&
                              activeSet.time_completed !== null && (
                                <div className="text-lg text-success">
                                  Completed at{" "}
                                  <span className="font-semibold">
                                    {ConvertDateStringToTimeString(
                                      activeSet.time_completed,
                                      userSettings.clock_style === "24h"
                                    )}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <ChevronIcon
                            size={34}
                            color="#eab308"
                            direction={isActiveSetExpanded ? "down" : "up"}
                          />
                        </div>
                      </div>
                    </button>
                    {isActiveSetExpanded ? (
                      <div className="flex flex-col px-1.5 h-full">
                        {activeGroupedSet?.exercise.isInvalid ? (
                          <div className="flex flex-col p-5 justify-center gap-3">
                            <div className="flex justify-center text-lg text-center font-medium">
                              This Set is referencing an Exercise that has been
                              deleted.
                            </div>
                            <Button
                              className="font-medium"
                              variant="flat"
                              onPress={() =>
                                handleReassignExercise(activeGroupedSet)
                              }
                            >
                              Reassign Exercise
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex flex-col">
                              <div className="flex justify-between gap-1.5">
                                <div>
                                  {showCommentInput && (
                                    <Input
                                      value={activeSet.comment ?? ""}
                                      label="Comment"
                                      labelPlacement="outside-left"
                                      size="sm"
                                      variant="faded"
                                      onValueChange={(value) =>
                                        setActiveSet((prev) => ({
                                          ...prev!,
                                          comment: value,
                                        }))
                                      }
                                      isInvalid={isResistanceLevelInputInvalid}
                                      isClearable
                                    />
                                  )}
                                  {activeSetNote !== undefined && (
                                    <div className="flex gap-2 items-center pt-1.5">
                                      <h3 className="font-medium text-lg">
                                        {activeSetNote.note_type}
                                      </h3>
                                      <Button
                                        className="h-7"
                                        size="sm"
                                        variant="flat"
                                        onPress={() =>
                                          setActiveSetNote(undefined)
                                        }
                                      >
                                        Hide
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <div className="flex">
                                  <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onPress={() =>
                                      setShowCommentInput((prev) => !prev)
                                    }
                                  >
                                    <CommentIcon size={20} />
                                  </Button>
                                  <Dropdown>
                                    <DropdownTrigger>
                                      <Button
                                        isIconOnly
                                        variant="light"
                                        size="sm"
                                        isDisabled={
                                          activeSet.comment === null &&
                                          activeGroupedSet?.exercise.note ===
                                            null &&
                                          activeSet.note === null
                                        }
                                      >
                                        <VerticalMenuIcon size={18} />
                                      </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                      aria-label="Active Set Option Menu"
                                      itemClasses={{
                                        base: "hover:text-[#404040] gap-4",
                                      }}
                                      onAction={(key) =>
                                        handleActiveSetOptionSelection(
                                          key as string
                                        )
                                      }
                                    >
                                      <DropdownItem
                                        className={
                                          activeSetNote ? "" : "hidden"
                                        }
                                        key="hide-note"
                                      >
                                        Hide Note
                                      </DropdownItem>
                                      <DropdownItem
                                        className={
                                          activeSet.note === null
                                            ? "hidden"
                                            : ""
                                        }
                                        key="show-set-note"
                                      >
                                        Show Set Note
                                      </DropdownItem>
                                      <DropdownItem
                                        className={
                                          activeGroupedSet?.exercise.note ===
                                          null
                                            ? "hidden"
                                            : ""
                                        }
                                        key="show-exercise-note"
                                      >
                                        Show Exercise Note
                                      </DropdownItem>
                                      <DropdownItem
                                        className={
                                          activeSet.comment === null
                                            ? "hidden"
                                            : ""
                                        }
                                        key="show-set-comment"
                                      >
                                        Show Set Comment
                                      </DropdownItem>
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              </div>
                              {activeSetNote !== undefined && (
                                <div className="flex flex-col">
                                  <div className="text-stone-500 break-words">
                                    {activeSetNote.note}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 justify-evenly pt-2">
                              {!!activeSet.is_tracking_weight && (
                                <div className="flex justify-between gap-2 w-56">
                                  <Input
                                    value={activeSetTrackingValuesInput.weight}
                                    label="Weight"
                                    variant="faded"
                                    labelPlacement="outside-left"
                                    onValueChange={(value) =>
                                      setActiveSetTrackingValuesInput(
                                        (prev: SetTrackingValuesInput) => ({
                                          ...prev,
                                          weight: value,
                                        })
                                      )
                                    }
                                    isInvalid={isWeightInputInvalid}
                                    isClearable
                                  />
                                  <WeightUnitDropdown
                                    value={activeSet.weight_unit}
                                    setSet={setActiveSet as SetWorkoutSetAction}
                                    targetType="set"
                                  />
                                </div>
                              )}
                              {!!activeSet.is_tracking_reps && (
                                <Input
                                  className="w-28"
                                  value={activeSetTrackingValuesInput.reps}
                                  label="Reps"
                                  variant="faded"
                                  labelPlacement="outside-left"
                                  onValueChange={(value) =>
                                    setActiveSetTrackingValuesInput(
                                      (prev: SetTrackingValuesInput) => ({
                                        ...prev,
                                        reps: value,
                                      })
                                    )
                                  }
                                  isInvalid={isRepsInputInvalid}
                                  isClearable
                                />
                              )}
                              {!!activeSet.is_tracking_distance && (
                                <div className="flex justify-between gap-2 w-64">
                                  <Input
                                    value={
                                      activeSetTrackingValuesInput.distance
                                    }
                                    label="Distance"
                                    variant="faded"
                                    labelPlacement="outside-left"
                                    onValueChange={(value) =>
                                      setActiveSetTrackingValuesInput(
                                        (prev: SetTrackingValuesInput) => ({
                                          ...prev,
                                          distance: value,
                                        })
                                      )
                                    }
                                    isInvalid={isDistanceInputInvalid}
                                    isClearable
                                  />
                                  <DistanceUnitDropdown
                                    value={activeSet.distance_unit}
                                    setSet={setActiveSet as SetWorkoutSetAction}
                                    targetType="set"
                                  />
                                </div>
                              )}
                              {!!activeSet.is_tracking_time && (
                                <TimeInput
                                  value={activeSet}
                                  setValue={setActiveSet as SetWorkoutSetAction}
                                  defaultTimeInput={
                                    userSettings!.default_time_input!
                                  }
                                  setIsInvalid={setIsActiveSetTimeInputInvalid}
                                  time_input_behavior_hhmmss={
                                    userSettings!.time_input_behavior_hhmmss!
                                  }
                                  time_input_behavior_mmss={
                                    userSettings!.time_input_behavior_mmss!
                                  }
                                />
                              )}
                              {!!activeSet.is_tracking_rir && (
                                <Input
                                  className="w-[6.5rem]"
                                  value={activeSetTrackingValuesInput.rir}
                                  label="RIR"
                                  variant="faded"
                                  labelPlacement="outside-left"
                                  onValueChange={(value) =>
                                    setActiveSetTrackingValuesInput(
                                      (prev: SetTrackingValuesInput) => ({
                                        ...prev,
                                        rir: value,
                                      })
                                    )
                                  }
                                  isInvalid={isRirInputInvalid}
                                  isClearable
                                />
                              )}
                              {!!activeSet.is_tracking_rpe && (
                                <Input
                                  className="w-[6.5rem]"
                                  value={activeSetTrackingValuesInput.rpe}
                                  label="RPE"
                                  variant="faded"
                                  labelPlacement="outside-left"
                                  onValueChange={(value) =>
                                    setActiveSetTrackingValuesInput(
                                      (prev: SetTrackingValuesInput) => ({
                                        ...prev,
                                        rpe: value,
                                      })
                                    )
                                  }
                                  isInvalid={isRpeInputInvalid}
                                  isClearable
                                />
                              )}
                              {!!activeSet.is_tracking_resistance_level && (
                                <Input
                                  className="w-auto"
                                  classNames={{
                                    label: "whitespace-nowrap",
                                    input: "w-16",
                                  }}
                                  value={
                                    activeSetTrackingValuesInput.resistance_level
                                  }
                                  label="Resistance Level"
                                  variant="faded"
                                  labelPlacement="outside-left"
                                  onValueChange={(value) =>
                                    setActiveSetTrackingValuesInput(
                                      (prev: SetTrackingValuesInput) => ({
                                        ...prev,
                                        resistance_level: value,
                                      })
                                    )
                                  }
                                  isInvalid={isResistanceLevelInputInvalid}
                                  isClearable
                                />
                              )}
                            </div>
                            <div className="flex justify-between pt-3">
                              <div className="flex gap-1">
                                <Button
                                  color="success"
                                  variant="light"
                                  onPress={() =>
                                    handleEditSet(
                                      activeSet,
                                      activeSet.set_index!,
                                      activeGroupedSet!.exercise
                                    )
                                  }
                                >
                                  Edit Set
                                </Button>
                              </div>
                              <div className="flex gap-1.5">
                                <Button
                                  color="success"
                                  variant="light"
                                  onPress={() =>
                                    setActiveSetTrackingValuesInput(
                                      defaultSetInputValues
                                    )
                                  }
                                >
                                  Clear
                                </Button>
                                <Button
                                  color="success"
                                  isDisabled={isSetTrackingInputsInvalid}
                                  onPress={saveActiveSet}
                                >
                                  {activeSet.is_completed ? "Update" : "Save"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex h-full justify-end items-end">
                          <Button
                            isIconOnly
                            size="lg"
                            variant="light"
                            onPress={() => setIsActiveSetExpanded(false)}
                          >
                            <MinimizeIcon color="#eab308" />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

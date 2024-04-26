import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Workout,
  WorkoutSet,
  UserSettings,
  ExerciseWithGroupString,
  SetTrackingValuesInput,
  SetWorkoutSetAction,
  GroupedWorkoutSet,
} from "../typings";
import {
  LoadingSpinner,
  WeightUnitDropdown,
  DistanceUnitDropdown,
  TimeInput,
  WorkoutRatingDropdown,
} from "../components";
import Database from "tauri-plugin-sql-api";
import { NotFound } from ".";
import {
  CreateSetsFromWorkoutTemplate,
  GetUserSettings,
  DefaultNewSet,
  GetExerciseListWithGroupStrings,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove10,
  ConvertSetInputValuesToNumbers,
  DefaultSetInputValues,
  FormatDateString,
  FormatTimeInSecondsToHhmmssString,
  ConvertDateStringToTimeString,
  CreateGroupedWorkoutSetListByExerciseId,
  GenerateExerciseOrderString,
  InsertSetIntoDatabase,
} from "../helpers";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  ScrollShadow,
  Checkbox,
  Input,
  Accordion,
  AccordionItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Reorder } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { SearchIcon, CommentIcon, VerticalMenuIcon } from "../assets";

type OperationType =
  | "add"
  | "edit"
  | "delete-set"
  | "change-exercise"
  | "delete-exercise-sets";

export default function WorkoutDetails() {
  const [workout, setWorkout] = useState<Workout>();
  const [workoutDate, setWorkoutDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [groupedSets, setGroupedSets] = useState<GroupedWorkoutSet[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [exercises, setExercises] = useState<ExerciseWithGroupString[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseWithGroupString>();
  const [numNewSets, setNumNewSets] = useState<string>("1");
  const [workoutNote, setWorkoutNote] = useState<string>("");
  const [activeSet, setActiveSet] = useState<WorkoutSet>();
  const [isTimeInputInvalid, setIsTimeInputInvalid] = useState<boolean>(false);
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false);
  const [showWorkoutNoteInput, setShowWorkoutNoteInput] =
    useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set(["active-set"])
  );
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [operatingGroupedSet, setOperatingGroupedSet] =
    useState<GroupedWorkoutSet>();

  const initialized = useRef(false);

  const { id } = useParams();

  const defaultNewSet: WorkoutSet = DefaultNewSet(false);
  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(defaultNewSet);

  const defaultSetInputValues: SetTrackingValuesInput = DefaultSetInputValues();

  const [setTrackingValuesInput, setSetTrackingValuesInput] =
    useState<SetTrackingValuesInput>(defaultSetInputValues);

  const newSetModal = useDisclosure();
  const deleteModal = useDisclosure();

  const numSetsOptions: string[] = ["1", "2", "3", "4", "5", "6"];

  const filteredExercises = useMemo(() => {
    if (filterQuery !== "") {
      return exercises.filter(
        (item) =>
          item.name
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase()) ||
          item.exercise_group_string
            .toLocaleLowerCase()
            .includes(filterQuery.toLocaleLowerCase())
      );
    }
    return exercises;
  }, [exercises, filterQuery]);

  const updateWorkout = useCallback(async (workout: Workout) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute(
        `UPDATE workouts SET 
        workout_template_id = $1, date = $2, set_list_order = $3,
        exercise_order = $4, note = $5, is_loaded = $6, rating = $7
        WHERE id = $8`,
        [
          workout.workout_template_id,
          workout.date,
          workout.set_list_order,
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
            `SELECT sets.*, exercises.name AS exercise_name,
            exercises.note AS exercise_note
            FROM sets 
            JOIN exercises ON sets.exercise_id = exercises.id 
            WHERE workout_id = $1 AND is_template = 0`,
            [id]
          );

          const groupedSetList: GroupedWorkoutSet[] =
            CreateGroupedWorkoutSetListByExerciseId(
              setList,
              workout.exercise_order
            );

          setWorkoutNote(workout.note === null ? "" : workout.note);
          setGroupedSets(groupedSetList);

          // TODO: SET FIRST INCOMPLETE FOR GROUPEDSETS
          // if (orderedSetList.length > 0) {
          //   const firstIncompleteIndex = orderedSetList.findIndex(
          //     (obj) => obj.is_completed === 0
          //   );
          //   if (firstIncompleteIndex !== -1)
          //     setActiveSet(orderedSetList[firstIncompleteIndex]);
          // }
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
          }

          workout.is_loaded = 1;

          await updateWorkout(workout);
        }

        const formattedDate: string = FormatDateString(workout.date);

        setWorkout(workout);
        setWorkoutDate(formattedDate);
        setIsLoading(false);
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

    const getExerciseList = async () => {
      const exercises = await GetExerciseListWithGroupStrings();
      if (exercises !== undefined) setExercises(exercises);
    };

    loadWorkout();
    loadUserSettings();
    getExerciseList();
  }, [id, updateWorkout]);

  const updateExerciseOrder = async (
    setList: GroupedWorkoutSet[] = groupedSets
  ) => {
    if (workout === undefined) return;

    const exerciseOrderString: string = GenerateExerciseOrderString(setList);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        `UPDATE workouts SET exercise_order = $1 WHERE id = $2`,
        [exerciseOrderString, workout.id]
      );
    } catch (error) {
      console.log(error);
    }
  };

  const addSet = async () => {
    if (selectedExercise === undefined || workout === undefined) return;

    if (!numSetsOptions.includes(numNewSets)) return;

    try {
      const noteToInsert: string | null =
        operatingSet.note?.trim().length === 0 ? null : operatingSet.note;

      const newSets: WorkoutSet[] = [];

      const numSetsToAdd: number = parseInt(numNewSets);

      for (let i = 0; i < numSetsToAdd; i++) {
        const newSet: WorkoutSet = {
          ...operatingSet,
          exercise_id: selectedExercise.id,
          workout_id: workout.id,
          note: noteToInsert,
          exercise_name: selectedExercise.name,
        };

        const setId: number = await InsertSetIntoDatabase(newSet);

        if (setId === 0) return;

        newSets.push({ ...newSet, id: setId });
      }

      const exerciseIndex: number = groupedSets.findIndex(
        (obj) => obj.exercise_id === selectedExercise.id
      );

      if (exerciseIndex === -1) {
        // Create new GroupedWorkoutSet if exercise_id does not exist in groupedSets
        const newGroupedWorkoutSet: GroupedWorkoutSet = {
          exercise_name: selectedExercise.name,
          exercise_id: selectedExercise.id,
          setList: newSets,
          exercise_note: selectedExercise.note,
        };

        const newGroupedSets: GroupedWorkoutSet[] = [
          ...groupedSets,
          newGroupedWorkoutSet,
        ];

        setGroupedSets(newGroupedSets);
        await updateExerciseOrder(newGroupedSets);
      } else {
        // Add new Sets to groupedSets' existing Exercise's Set List
        setGroupedSets((prev) => {
          const newList = [...prev];
          newList[exerciseIndex].setList = [
            ...newList[exerciseIndex].setList,
            ...newSets,
          ];
          return newList;
        });
      }

      resetSetToDefault();

      newSetModal.onClose();
      toast.success("Set Added");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteSet = async () => {
    if (operatingSet === undefined || operationType !== "delete-set") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from sets WHERE id = $1", [operatingSet.id]);

      const exerciseIndex: number = groupedSets.findIndex(
        (obj) => obj.exercise_id === operatingSet.exercise_id
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

      resetSetToDefault();

      toast.success("Set Deleted");
      deleteModal.onClose();
    } catch (error) {
      console.log(error);
    }
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
        [operatingGroupedSet.exercise_id, workout.id]
      );

      const updatedSetList: GroupedWorkoutSet[] = groupedSets.filter(
        (item) => item.exercise_id !== operatingGroupedSet.exercise_id
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

  const resetSetToDefault = () => {
    setOperationType("add");
    setSelectedExercise(undefined);
    setOperatingGroupedSet(undefined);
    setOperatingSet({
      ...defaultNewSet,
      weight_unit: userSettings!.default_unit_weight!,
      distance_unit: userSettings!.default_unit_distance!,
    });
  };

  const handleSaveSetButton = async () => {
    if (operationType === "add") {
      await addSet();
    }
    if (operationType === "edit") {
      await updateSet();
    }
  };

  const handleAddSetButton = () => {
    if (operationType !== "add") {
      resetSetToDefault();
    }

    newSetModal.onOpen();
  };

  const handleClickExercise = (exercise: ExerciseWithGroupString) => {
    setSelectedExercise(exercise);

    if (operationType === "edit") {
      setOperatingSet((prev) => ({ ...prev, exercise_id: exercise.id }));
      return;
    }

    if (exercise.exercise_group_string === "Cardio") {
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

  const updateSet = async () => {
    if (selectedExercise === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const noteToInsert: string | null =
        operatingSet.note?.trim().length === 0 ? null : operatingSet.note;

      await db.execute(
        `UPDATE sets SET 
        exercise_id = $1, note = $2, is_warmup = $3, is_tracking_weight = $4,
        is_tracking_reps = $5, is_tracking_rir = $6, is_tracking_rpe = $7, 
        is_tracking_time = $8, is_tracking_distance = $9, is_tracking_resistance_level = $10 
        WHERE id = $11`,
        [
          selectedExercise.id,
          noteToInsert,
          operatingSet.is_warmup,
          operatingSet.is_tracking_weight,
          operatingSet.is_tracking_reps,
          operatingSet.is_tracking_rir,
          operatingSet.is_tracking_rpe,
          operatingSet.is_tracking_time,
          operatingSet.is_tracking_distance,
          operatingSet.is_tracking_resistance_level,
          operatingSet.id,
        ]
      );

      const updatedSet: WorkoutSet = {
        ...operatingSet,
        exercise_id: selectedExercise.id,
        note: noteToInsert,
        exercise_name: selectedExercise.name,
      };

      const exerciseIndex: number = groupedSets.findIndex(
        (obj) => obj.exercise_id === operatingSet.exercise_id
      );

      const updatedSetList: WorkoutSet[] = groupedSets[
        exerciseIndex
      ].setList.map((item) =>
        item.id === operatingSet.id ? updatedSet : item
      );

      setGroupedSets((prev) => {
        const newList = [...prev];
        newList[exerciseIndex].setList = updatedSetList;
        return newList;
      });

      // TODO: UPDATE ACTIVESET IF EDITED
      //   if (activeSet?.id === updatedSet.id) {
      //     setActiveSet({
      //       ...activeSet,
      //       exercise_id: selectedExercise.id,
      //       note: noteToInsert,
      //       exercise_name: selectedExercise.name,
      //       is_warmup: updatedSet.is_warmup,
      //       is_tracking_weight: updatedSet.is_tracking_weight,
      //       is_tracking_reps: updatedSet.is_tracking_reps,
      //       is_tracking_rir: updatedSet.is_tracking_rir,
      //       is_tracking_rpe: updatedSet.is_tracking_rpe,
      //       is_tracking_time: updatedSet.is_tracking_time,
      //       is_tracking_distance: updatedSet.is_tracking_distance,
      //       is_tracking_resistance_level: updatedSet.is_tracking_resistance_level,
      //     });
      //   }

      resetSetToDefault();

      newSetModal.onClose();
      toast.success("Set Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditSet = (set: WorkoutSet) => {
    const exercise = exercises.find((item) => item.id === set.exercise_id);

    if (exercise === undefined) return;

    setOperatingSet(set);
    setOperationType("edit");
    setSelectedExercise(exercise);

    newSetModal.onOpen();
  };

  const handleSaveNoteButton = async () => {
    if (workout === undefined) return;

    const noteToInsert: string | null =
      workoutNote.trim().length === 0 ? null : workoutNote;

    const updatedWorkout: Workout = { ...workout, note: noteToInsert };

    await updateWorkout(updatedWorkout);
    setWorkout(updatedWorkout);
  };

  const isWeightInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(setTrackingValuesInput.weight);
  }, [setTrackingValuesInput.weight]);

  const isRepsInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(setTrackingValuesInput.reps);
  }, [setTrackingValuesInput.reps]);

  const isDistanceInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(setTrackingValuesInput.distance);
  }, [setTrackingValuesInput.distance]);

  const isRirInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(setTrackingValuesInput.rir);
  }, [setTrackingValuesInput.rir]);

  const isRpeInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOrAbove10(setTrackingValuesInput.rpe);
  }, [setTrackingValuesInput.rpe]);

  const isResistanceLevelInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(setTrackingValuesInput.resistance_level);
  }, [setTrackingValuesInput.resistance_level]);

  const isSetTrackingInputsInvalid = useMemo(() => {
    if (isWeightInputInvalid) return true;
    if (isRepsInputInvalid) return true;
    if (isDistanceInputInvalid) return true;
    if (isTimeInputInvalid) return true;
    if (isRirInputInvalid) return true;
    if (isRpeInputInvalid) return true;
    if (isResistanceLevelInputInvalid) return true;
    return false;
  }, [
    isWeightInputInvalid,
    isRepsInputInvalid,
    isDistanceInputInvalid,
    isTimeInputInvalid,
    isRirInputInvalid,
    isRpeInputInvalid,
    isResistanceLevelInputInvalid,
  ]);

  const saveActiveSet = async () => {
    // TODO: FIX
    // if (activeSet === undefined || workout === undefined) return;
    // if (isSetTrackingInputsInvalid) return;
    // const currentDate = new Date().toString();
    // const setTrackingValuesNumbers = ConvertSetInputValuesToNumbers(
    //   setTrackingValuesInput
    // );
    // try {
    //   const db = await Database.load(import.meta.env.VITE_DB);
    //   const commentToInsert: string | null =
    //     activeSet.comment?.trim().length === 0 ? null : activeSet.comment;
    //   await db.execute(
    //     `UPDATE sets SET
    //     weight = $1, reps = $2, distance = $3, time_in_seconds = $4, rir = $5,
    //     rpe = $6, resistance_level = $7, weight_unit = $8, distance_unit = $9,
    //     comment = $10, time_completed = $11, is_completed = 1
    //     WHERE id = $12`,
    //     [
    //       setTrackingValuesNumbers.weight,
    //       setTrackingValuesNumbers.reps,
    //       setTrackingValuesNumbers.distance,
    //       activeSet.time_in_seconds,
    //       setTrackingValuesNumbers.rir,
    //       setTrackingValuesNumbers.rpe,
    //       setTrackingValuesNumbers.resistance_level,
    //       activeSet.weight_unit,
    //       activeSet.distance_unit,
    //       commentToInsert,
    //       currentDate,
    //       activeSet.id,
    //     ]
    //   );
    //   const updatedSet: WorkoutSet = {
    //     ...activeSet,
    //     weight: setTrackingValuesNumbers.weight,
    //     reps: setTrackingValuesNumbers.reps,
    //     distance: setTrackingValuesNumbers.distance,
    //     rir: setTrackingValuesNumbers.rir,
    //     rpe: setTrackingValuesNumbers.rpe,
    //     resistance_level: setTrackingValuesNumbers.resistance_level,
    //     is_completed: 1,
    //     time_completed: currentDate,
    //   };
    //   setSets((prev) =>
    //     prev.map((item) => (item.id === activeSet.id ? updatedSet : item))
    //   );
    //   const activeSetIndex: number = sets.indexOf(activeSet);
    //   if (activeSetIndex < sets.length - 1) {
    //     setActiveSet(sets[activeSetIndex + 1]);
    //   }
    //   setShowCommentInput(false);
    //   toast.success("Set Saved");
    // } catch (error) {
    //   console.log(error);
    // }
  };

  const handleClickActiveSet = (set: WorkoutSet) => {
    setActiveSet(set);
    setSelectedKeys(new Set(["active-set"]));
  };

  const handleSetOptionSelection = (key: string, set: WorkoutSet) => {
    if (key === "edit") {
      handleEditSet(set);
    } else if (key === "delete-set") {
      handleDeleteSet(set);
    }
  };

  const handleDeleteSet = (set: WorkoutSet) => {
    setOperatingSet(set);
    setOperationType("delete-set");

    deleteModal.onOpen();
  };

  const handleDeleteExerciseSets = (groupedWorkoutSet: GroupedWorkoutSet) => {
    setOperationType("delete-exercise-sets");
    setOperatingGroupedSet(groupedWorkoutSet);

    deleteModal.onOpen();
  };

  const handleDeleteModalButton = () => {
    if (operationType === "delete-exercise-sets") {
      deleteAllSetsForExerciseId();
    } else if (operationType === "delete-set") {
      deleteSet();
    }
  };

  const handleExerciseOptionSelection = (
    key: string,
    groupedWorkoutSet: GroupedWorkoutSet
  ) => {
    if (key === "delete-exercise-sets") {
      handleDeleteExerciseSets(groupedWorkoutSet);
    } 
    // else if (key === "add-set-to-exercise") {
    //   handleAddSetToExercise(groupedWorkoutSet);
    // }
  };

  if (workout === undefined) return NotFound();

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Set{operationType === "delete-exercise-sets" && "s"}
              </ModalHeader>
              <ModalBody>
                <p className="break-all">
                  {operationType === "delete-exercise-sets"
                    ? `Are you sure you want to delete all ${operatingGroupedSet?.exercise_name} sets from Workout Template?`
                    : `Are you sure you want to delete ${operatingSet.exercise_name} set?`}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={handleDeleteModalButton}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={newSetModal.isOpen}
        onOpenChange={newSetModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedExercise === undefined
                  ? "Select Exercise"
                  : "Tracking Options"}
              </ModalHeader>
              <ModalBody>
                {selectedExercise === undefined ? (
                  <div className="h-[400px] flex flex-col gap-2">
                    <Input
                      label="Search"
                      variant="faded"
                      placeholder="Type to search..."
                      isClearable
                      value={filterQuery}
                      onValueChange={setFilterQuery}
                      startContent={<SearchIcon />}
                    />
                    <ScrollShadow className="flex flex-col gap-1">
                      {filteredExercises.map((exercise) => (
                        <button
                          key={exercise.id}
                          className="flex flex-col justify-start items-start bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:bg-default-200 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                          onClick={() => handleClickExercise(exercise)}
                        >
                          <span className="text-md max-w-full truncate">
                            {exercise.name}
                          </span>
                          <span className="text-xs text-stone-500 text-left">
                            {exercise.exercise_group_string}
                          </span>
                        </button>
                      ))}
                    </ScrollShadow>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 h-[400px]">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold px-1 truncate w-4/6">
                          {selectedExercise.name}
                        </h2>
                      </div>
                      <Input
                        value={operatingSet.note ?? ""}
                        label="Note"
                        variant="faded"
                        size="sm"
                        onValueChange={(value) =>
                          setOperatingSet((prev) => ({
                            ...prev,
                            note: value,
                          }))
                        }
                        isClearable
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-semibold px-1">Track</h3>
                      <div className="grid grid-cols-2 gap-2 p-1">
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_weight ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_weight: value ? 1 : 0,
                            }))
                          }
                        >
                          Weight
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_reps ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_reps: value ? 1 : 0,
                            }))
                          }
                        >
                          Reps
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_distance ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_distance: value ? 1 : 0,
                            }))
                          }
                        >
                          Distance
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_time ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_time: value ? 1 : 0,
                            }))
                          }
                        >
                          Time
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_rir ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_rir: value ? 1 : 0,
                            }))
                          }
                        >
                          RIR
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_rpe ? true : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_rpe: value ? 1 : 0,
                            }))
                          }
                        >
                          RPE
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={
                            operatingSet.is_tracking_resistance_level
                              ? true
                              : false
                          }
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_tracking_resistance_level: value ? 1 : 0,
                            }))
                          }
                        >
                          Resistance Level
                        </Checkbox>
                        <Checkbox
                          color="success"
                          isSelected={operatingSet.is_warmup ? true : false}
                          onValueChange={(value) =>
                            setOperatingSet((prev) => ({
                              ...prev,
                              is_warmup: value ? 1 : 0,
                            }))
                          }
                        >
                          <span className="text-primary">Warmup Set</span>
                        </Checkbox>
                      </div>
                      {operationType === "add" && (
                        <div className="flex flex-row justify-between">
                          <Select
                            label="Number Of Sets To Add"
                            variant="faded"
                            selectedKeys={[numNewSets]}
                            disallowEmptySelection={true}
                            onChange={(e) => setNumNewSets(e.target.value)}
                          >
                            {numSetsOptions.map((num) => (
                              <SelectItem key={num} value={num}>
                                {num}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  isDisabled={selectedExercise === undefined}
                  onPress={handleSaveSetButton}
                >
                  {operationType === "edit" ? "Save" : "Add"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
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
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold flex items-center justify-between">
                Set List{" "}
                {groupedSets.length > 1 && (
                  <span className="text-xs italic text-stone-500 font-normal">
                    Drag Exercises To Reorder Set List
                  </span>
                )}
              </h2>
              <div className="flex flex-col gap-1">
                <Reorder.Group
                  className="flex flex-col gap-1"
                  values={groupedSets}
                  onReorder={setGroupedSets}
                >
                  {groupedSets.map((exercise) => (
                    <Reorder.Item
                      key={exercise.exercise_id}
                      value={exercise}
                      onDragEnd={() => updateExerciseOrder()}
                    >
                      <Accordion isCompact variant="shadow">
                        <AccordionItem
                          classNames={{
                            titleWrapper: "truncate",
                            title:
                              exercise.exercise_name === "Unknown Exercise"
                                ? "text-red-500 truncate"
                                : "truncate",
                          }}
                          key={exercise.exercise_id}
                          aria-label={`Accordion ${exercise.exercise_name}`}
                          title={exercise.exercise_name}
                          subtitle={`${exercise.setList.length} Sets`}
                        >
                          <div className="flex flex-col divide-y divide-stone-200">
                            <div className="flex justify-between items-center pb-1">
                              <span className="text-stone-400 break-all max-w-60">
                                {exercise.exercise_note}
                              </span>
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button size="sm" variant="flat">
                                    Exercise Options
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  aria-label={`Option Menu For ${exercise.exercise_name}`}
                                  itemClasses={{
                                    base: "hover:text-[#404040] gap-4",
                                  }}
                                  onAction={(key) =>
                                    handleExerciseOptionSelection(
                                      key as string,
                                      exercise
                                    )
                                  }
                                >
                                  <DropdownItem key="add-set-to-exercise">
                                    Add Set
                                  </DropdownItem>
                                  {exercise.exercise_name ===
                                  "Unknown Exercise" ? (
                                    <DropdownItem key="reassign-exercise">
                                      Reassign Exercise
                                    </DropdownItem>
                                  ) : (
                                    <DropdownItem key="change-exercise">
                                      Change Exercise
                                    </DropdownItem>
                                  )}
                                  <DropdownItem
                                    className="text-danger"
                                    key="delete-exercise-sets"
                                  >
                                    Delete All Sets
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                            {exercise.setList.map((set, index) => (
                              <div
                                className="flex flex-col px-0.5 text-sm font-medium break-all"
                                key={`${set.exercise_id}-${index}`}
                              >
                                <div className="flex justify-between items-center h-8">
                                  <span>Set {index + 1}</span>
                                  {set.is_tracking_weight === 1 &&
                                    set.weight > 0 && (
                                      <span className="truncate max-w-16">
                                        {set.weight} {set.weight_unit}
                                      </span>
                                    )}
                                  {set.is_tracking_reps === 1 &&
                                    set.reps > 0 && (
                                      <span className="truncate max-w-16">
                                        {set.reps} Rep{set.reps > 1 && "s"}
                                      </span>
                                    )}
                                  {set.is_tracking_distance === 1 &&
                                    set.distance > 0 && (
                                      <span className="truncate max-w-16">
                                        {set.distance} {set.distance_unit}
                                      </span>
                                    )}
                                  <div className="flex w-12 justify-end">
                                    {set.note !== null && (
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        radius="lg"
                                        variant="light"
                                        // TODO: FIX
                                        // onPress={() =>
                                        //   handleSetListNoteButton(
                                        //     exercise.exercise_id,
                                        //     index
                                        //   )
                                        // }
                                      >
                                        <CommentIcon size={20} />
                                      </Button>
                                    )}
                                    <Dropdown>
                                      <DropdownTrigger>
                                        <Button
                                          isIconOnly
                                          size="sm"
                                          radius="lg"
                                          variant="light"
                                        >
                                          <VerticalMenuIcon size={14} />
                                        </Button>
                                      </DropdownTrigger>
                                      <DropdownMenu
                                        aria-label={`Option Menu For ${exercise.exercise_name} Set ${index}`}
                                        itemClasses={{
                                          base: "hover:text-[#404040] gap-4",
                                        }}
                                        onAction={(key) =>
                                          handleSetOptionSelection(
                                            key as string,
                                            set
                                          )
                                        }
                                      >
                                        <DropdownItem key="edit">
                                          Edit
                                        </DropdownItem>
                                        <DropdownItem
                                          className="text-danger"
                                          key="delete-set"
                                        >
                                          Delete
                                        </DropdownItem>
                                      </DropdownMenu>
                                    </Dropdown>
                                  </div>
                                </div>
                                {/* TODO: ADD USESTATE */}
                                {/* {shownSetListNotes[exercise.exercise_id]?.has(
                                  index
                                ) && (
                                  <span className="text-stone-400 pb-1">
                                    {set.note}
                                  </span>
                                )} */}
                              </div>
                            ))}
                          </div>
                        </AccordionItem>
                      </Accordion>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </div>
            <div className="flex gap-1 justify-center">
              <Button color="success" onPress={handleAddSetButton}>
                Add Set
              </Button>
              {/* <Button color="success" onPress={() => supersetModal.onOpen()}>
                Add Superset
              </Button>
              <Button color="success" onPress={() => dropsetModal.onOpen()}>
                Add Dropset
              </Button> */}
            </div>

            {/* <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold flex items-center justify-between">
                Set List{" "}
                {sets.length > 1 && (
                  <span className="text-xs italic text-stone-500 font-normal">
                    Drag Sets To Reorder Set List
                  </span>
                )}
              </h2>
              <div className="flex flex-col gap-1">
                <Reorder.Group
                  className="flex flex-col gap-1"
                  values={sets}
                  onReorder={setSets}
                >
                  {sets.map((set) => (
                    <Reorder.Item
                      key={set.id}
                      value={set}
                      onDragEnd={() => updateSetListOrder()}
                      onClick={() => handleClickActiveSet(set)}
                    >
                      <div
                        className={
                          set.id === activeSet?.id
                            ? "flex flex-col gap-0.5 outline outline-2 outline-yellow-300 bg-yellow-100 rounded-lg px-2.5 py-1.5 cursor-pointer"
                            : set.is_warmup
                            ? "flex flex-col gap-0.5 bg-orange-100 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-orange-200"
                            : "flex flex-col gap-0.5 bg-white rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-stone-50"
                        }
                      >
                        <div className="flex font-medium justify-between">
                          <span className="truncate text-lg max-w-52">
                            {set.exercise_name}
                          </span>
                          {set.is_warmup === 1 && (
                            <span className="text-orange-400">Warmup</span>
                          )}
                          {set.is_completed === 1 && (
                            <span className="text-success">
                              {userSettings?.show_timestamp_on_completed_set
                                ? ConvertDateStringToTimeString(
                                    set.time_completed!
                                  )
                                : "Completed"}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col">
                            <div className="flex gap-3">
                              {set.is_tracking_weight === 1 &&
                                (set.is_completed === 1 || set.weight > 0) && (
                                  <span>
                                    <strong className="font-semibold">
                                      {set.weight}
                                    </strong>{" "}
                                    {set.weight_unit}
                                  </span>
                                )}
                              {set.is_tracking_reps === 1 &&
                                (set.is_completed === 1 || set.reps > 0) && (
                                  <span>
                                    <strong className="font-semibold">
                                      {set.reps}
                                    </strong>{" "}
                                    Reps
                                  </span>
                                )}
                              {set.is_tracking_rir === 1 &&
                                set.is_completed === 1 && (
                                  <span>
                                    <strong className="font-semibold">
                                      {set.rir}
                                    </strong>{" "}
                                    RIR
                                  </span>
                                )}
                              {set.is_tracking_rpe === 1 &&
                                set.is_completed === 1 && (
                                  <span>
                                    <strong className="font-semibold">
                                      {set.rpe}
                                    </strong>{" "}
                                    RPE
                                  </span>
                                )}
                            </div>
                            <div className="flex justify-between">
                              <div className="flex gap-3">
                                {set.is_tracking_distance === 1 &&
                                  (set.is_completed === 1 ||
                                    set.distance > 0) && (
                                    <span>
                                      <strong className="font-semibold">
                                        {set.distance}
                                      </strong>{" "}
                                      {set.distance_unit}
                                    </span>
                                  )}
                                {set.is_tracking_time === 1 &&
                                  (set.is_completed === 1 ||
                                    set.time_in_seconds > 0) && (
                                    <span>
                                      <strong className="font-semibold">
                                        {FormatTimeInSecondsToHhmmssString(
                                          set.time_in_seconds
                                        )}
                                      </strong>
                                    </span>
                                  )}
                                {set.is_tracking_resistance_level === 1 &&
                                  (set.is_completed === 1 ||
                                    set.resistance_level > 0) && (
                                    <span>
                                      <strong className="font-semibold">
                                        {set.resistance_level}
                                      </strong>{" "}
                                      Resistance Level
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button
                              size="sm"
                              color="danger"
                              onPress={() => handleDeleteButton(set)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
              <div className="flex justify-center">
                <Button color="success" onPress={handleAddSetButton}>
                  Add Set
                </Button>
              </div> */}
            {/* {activeSet !== undefined && (
                <Accordion
                  variant="splitted"
                  className="fixed bottom-0 w-[400px]"
                  selectedKeys={selectedKeys}
                  onSelectionChange={(keys) =>
                    setSelectedKeys(keys as Set<string>)
                  }
                >
                  <AccordionItem
                    classNames={{
                      title: "text-2xl font-semibold text-yellow-500 break-all",
                    }}
                    className="border-2 border-yellow-300"
                    key="active-set"
                    aria-label="Active Set"
                    title={
                      activeSet.is_warmup
                        ? `${activeSet.exercise_name} (Warmup)`
                        : `${activeSet.exercise_name}`
                    }
                  >
                    <div className="flex flex-col gap-4">
                      {activeSet.note !== null && (
                        <div className="text-stone-500 text-lg">
                          <span className="font-semibold text-stone-600">
                            Note:
                          </span>{" "}
                          {activeSet.note}
                        </div>
                      )}
                      {userSettings?.show_timestamp_on_completed_set === 1 &&
                        activeSet.time_completed !== null && (
                          <div className="text-lg text-success">
                            Completed at{" "}
                            <span className="font-semibold">
                              {ConvertDateStringToTimeString(
                                activeSet.time_completed
                              )}
                            </span>
                          </div>
                        )}
                      <div className="flex flex-wrap gap-1.5 justify-evenly">
                        {!!activeSet.is_tracking_weight && (
                          <div className="flex justify-between gap-2 w-56">
                            <Input
                              value={setTrackingValuesInput.weight}
                              label="Weight"
                              variant="faded"
                              labelPlacement="outside-left"
                              onValueChange={(value) =>
                                setSetTrackingValuesInput(
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
                            value={setTrackingValuesInput.reps}
                            label="Reps"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              setSetTrackingValuesInput(
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
                              value={setTrackingValuesInput.distance}
                              label="Distance"
                              variant="faded"
                              labelPlacement="outside-left"
                              onValueChange={(value) =>
                                setSetTrackingValuesInput(
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
                            defaultTimeInput={userSettings!.default_time_input!}
                            setIsInvalid={setIsTimeInputInvalid}
                          />
                        )}
                        {!!activeSet.is_tracking_rir && (
                          <Input
                            className="w-[6.5rem]"
                            value={setTrackingValuesInput.rir}
                            label="RIR"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              setSetTrackingValuesInput(
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
                            value={setTrackingValuesInput.rpe}
                            label="RPE"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              setSetTrackingValuesInput(
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
                            value={setTrackingValuesInput.resistance_level}
                            label="Resistance Level"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              setSetTrackingValuesInput(
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
                        {showCommentInput && (
                          <Input
                            value={activeSet.comment ?? ""}
                            label="Comment"
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
                      </div>
                      <div className="flex justify-between">
                        <div className="flex gap-1">
                          <Button
                            color="success"
                            variant="flat"
                            onPress={() =>
                              setShowCommentInput(!showCommentInput)
                            }
                          >
                            Comment
                          </Button>
                          <Button
                            color="success"
                            variant="flat"
                            onPress={() => handleEditButton(activeSet)}
                          >
                            Edit
                          </Button>
                        </div>
                        <Button
                          color="success"
                          isDisabled={isSetTrackingInputsInvalid}
                          onPress={saveActiveSet}
                        >
                          {activeSet.is_completed ? "Update" : "Save"}
                        </Button>
                      </div>
                    </div>
                  </AccordionItem>
                </Accordion>
              )} */}
            {/* </div> */}
          </>
        )}
      </div>
    </>
  );
}

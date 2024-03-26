import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Workout,
  WorkoutSet,
  UserSettings,
  ExerciseWithGroupString,
  SetTrackingValuesInput,
  SetWorkoutSetAction,
} from "../typings";
import {
  LoadingSpinner,
  WeightUnitDropdown,
  DistanceUnitDropdown,
  TimeInput,
} from "../components";
import Database from "tauri-plugin-sql-api";
import { NotFound } from ".";
import {
  CreateSetsFromWorkoutTemplate,
  GenerateSetListOrderString,
  OrderSetsBySetListOrderString,
  GetUserSettings,
  DefaultNewSet,
  GetExerciseListWithGroupStrings,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove10,
  ConvertSetInputValuesToNumbers,
  DefaultSetInputValues,
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
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@nextui-org/react";
import { Reorder } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { SearchIcon } from "../assets";

export default function WorkoutDetails() {
  const [workout, setWorkout] = useState<Workout>();
  const [workoutDate, setWorkoutDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [setToDelete, setSetToDelete] = useState<WorkoutSet>();
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [exercises, setExercises] = useState<ExerciseWithGroupString[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseWithGroupString>();
  const [isEditingSet, setIsEditingSet] = useState<boolean>(false);
  const [numNewSets, setNumNewSets] = useState<string>("1");
  const [workoutNote, setWorkoutNote] = useState<string>("");
  const [activeSet, setActiveSet] = useState<WorkoutSet>();
  const [activeSetIndex, setActiveSetIndex] = useState<number>(0);
  const [isTimeInputInvalid, setIsTimeInputInvalid] = useState<boolean>(false);

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
        workout_template_id = $1, date = $2, set_list_order = $3, note = $4, is_loaded = $5 
        WHERE id = $6`,
        [
          workout.workout_template_id,
          workout.date,
          workout.set_list_order,
          workout.note,
          workout.is_loaded,
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

        if (workout.is_loaded) {
          const setList = await db.select<WorkoutSet[]>(
            `SELECT sets.*, exercises.name AS exercise_name
            FROM sets 
            JOIN exercises ON sets.exercise_id = exercises.id 
            WHERE workout_id = $1 AND is_template = 0`,
            [id]
          );

          const orderedSetList: WorkoutSet[] = OrderSetsBySetListOrderString(
            setList,
            workout.set_list_order
          );

          setSets(orderedSetList);
          setWorkoutNote(workout.note === null ? "" : workout.note);

          if (orderedSetList.length > 0) {
            // TODO: SET FIRST INCOMPLETE SET AS INDEX
            setActiveSet(orderedSetList[0]);
          }
        } else {
          // Stop useEffect running twice in dev
          if (!initialized.current) {
            initialized.current = true;
          } else return;

          if (workout.workout_template_id !== 0) {
            const setList = await CreateSetsFromWorkoutTemplate(
              workout.id,
              workout.workout_template_id
            );

            const setListOrder: string = GenerateSetListOrderString(setList);
            workout.set_list_order = setListOrder;

            setSets(setList);
          }

          workout.is_loaded = 1;

          await updateWorkout(workout);
        }

        const formattedDate: string = new Date(workout.date).toDateString();

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

  const updateSetListOrder = async (setList: WorkoutSet[] = sets) => {
    if (workout === undefined) return;

    const setListOrderString: string = GenerateSetListOrderString(setList);

    const updatedWorkout: Workout = {
      ...workout,
      set_list_order: setListOrderString,
    };

    await updateWorkout(updatedWorkout);
    setWorkout(updatedWorkout);
  };

  const deleteSet = async () => {
    if (setToDelete === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from sets WHERE id = $1", [setToDelete.id]);

      const updatedSetList: WorkoutSet[] = sets.filter(
        (item) => item.id !== setToDelete.id
      );
      setSets(updatedSetList);
      await updateSetListOrder(updatedSetList);

      toast.success("Set Deleted");
    } catch (error) {
      console.log(error);
    }

    setSetToDelete(undefined);
    deleteModal.onClose();
  };

  const handleDeleteButtonPress = (set: WorkoutSet) => {
    setSetToDelete(set);
    deleteModal.onOpen();
  };

  const resetSetToDefault = () => {
    setIsEditingSet(false);
    setSelectedExercise(undefined);
    setOperatingSet({
      ...defaultNewSet,
      weight_unit: userSettings!.default_unit_weight!,
      distance_unit: userSettings!.default_unit_distance!,
    });
  };

  const handleAddSetButtonPressed = () => {
    if (isEditingSet) {
      resetSetToDefault();
    }

    newSetModal.onOpen();
  };

  const handleExercisePressed = (exercise: ExerciseWithGroupString) => {
    setSelectedExercise(exercise);

    if (isEditingSet) {
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

  const addSet = async () => {
    if (selectedExercise === undefined || workout === undefined) return;

    if (!numSetsOptions.includes(numNewSets)) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const noteToInsert: string | null =
        operatingSet.note?.trim().length === 0 ? null : operatingSet.note;

      const newSets: WorkoutSet[] = [];

      const numSetsToAdd: number = parseInt(numNewSets);

      for (let i = 0; i < numSetsToAdd; i++) {
        const result = await db.execute(
          `INSERT into sets 
          (workout_id, exercise_id, is_template, workout_template_id, note, is_completed, is_warmup, 
            weight, reps, rir, rpe, time_in_seconds, distance, resistance_level, is_tracking_weight,
            is_tracking_reps, is_tracking_rir, is_tracking_rpe, is_tracking_time, is_tracking_distance,
            is_tracking_resistance_level, weight_unit, distance_unit) 
          VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
          [
            workout.id,
            selectedExercise.id,
            operatingSet.is_template,
            workout.workout_template_id,
            noteToInsert,
            operatingSet.is_completed,
            operatingSet.is_warmup,
            operatingSet.weight,
            operatingSet.reps,
            operatingSet.rir,
            operatingSet.rpe,
            operatingSet.time_in_seconds,
            operatingSet.distance,
            operatingSet.resistance_level,
            operatingSet.is_tracking_weight,
            operatingSet.is_tracking_reps,
            operatingSet.is_tracking_rir,
            operatingSet.is_tracking_rpe,
            operatingSet.is_tracking_time,
            operatingSet.is_tracking_distance,
            operatingSet.is_tracking_resistance_level,
            operatingSet.weight_unit,
            operatingSet.distance_unit,
          ]
        );

        const newSet: WorkoutSet = {
          ...operatingSet,
          id: result.lastInsertId,
          exercise_id: selectedExercise.id,
          workout_id: workout.id,
          note: noteToInsert,
          exercise_name: selectedExercise.name,
        };

        newSets.push(newSet);
      }

      const updatedSetList = [...sets, ...newSets];
      setSets(updatedSetList);
      await updateSetListOrder(updatedSetList);

      setOperatingSet({
        ...defaultNewSet,
        weight_unit: userSettings!.default_unit_weight!,
        distance_unit: userSettings!.default_unit_distance!,
      });
      resetSetToDefault();

      newSetModal.onClose();
      toast.success("Set Added");
    } catch (error) {
      console.log(error);
    }
  };

  const updateSet = async () => {
    if (selectedExercise === undefined || workout === undefined) return;

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

      if (activeSet?.id === updatedSet.id) {
        setActiveSet({
          ...activeSet,
          exercise_id: selectedExercise.id,
          note: noteToInsert,
          exercise_name: selectedExercise.name,
          is_warmup: updatedSet.is_warmup,
          is_tracking_weight: updatedSet.is_tracking_weight,
          is_tracking_reps: updatedSet.is_tracking_reps,
          is_tracking_rir: updatedSet.is_tracking_rir,
          is_tracking_rpe: updatedSet.is_tracking_rpe,
          is_tracking_time: updatedSet.is_tracking_time,
          is_tracking_distance: updatedSet.is_tracking_distance,
          is_tracking_resistance_level: updatedSet.is_tracking_resistance_level,
        });
      }

      setSets((prev) =>
        prev.map((item) => (item.id === operatingSet.id ? updatedSet : item))
      );

      resetSetToDefault();

      newSetModal.onClose();
      toast.success("Set Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveSetButtonPressed = async () => {
    if (isEditingSet) {
      await updateSet();
    } else {
      await addSet();
    }
  };

  const handleEditButtonPressed = (set: WorkoutSet) => {
    const exercise = exercises.find((item) => item.id === set.exercise_id);

    if (exercise === undefined) return;

    setOperatingSet(set);
    setIsEditingSet(true);
    setSelectedExercise(exercise);

    newSetModal.onOpen();
  };

  const handleSaveNoteButtonPressed = async () => {
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
    if (activeSet === undefined || workout === undefined) return;

    if (isSetTrackingInputsInvalid) return;

    const currentDate = new Date().toString();

    const setTrackingValuesNumbers = ConvertSetInputValuesToNumbers(
      setTrackingValuesInput
    );

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        `UPDATE sets SET
        weight = $1, reps = $2, distance = $3, time_in_seconds = $4, rir = $5,
        rpe = $6, resistance_level = $7, weight_unit = $8, distance_unit = $9,
        comment = $10, time_completed = $11, is_completed = 1
        WHERE id = $12`,
        [
          setTrackingValuesNumbers.weight,
          setTrackingValuesNumbers.reps,
          setTrackingValuesNumbers.distance,
          activeSet.time_in_seconds,
          setTrackingValuesNumbers.rir,
          setTrackingValuesNumbers.rpe,
          setTrackingValuesNumbers.resistance_level,
          activeSet.weight_unit,
          activeSet.distance_unit,
          activeSet.comment,
          currentDate,
          activeSet.id,
        ]
      );

      // TODO: UPDATE SET IN SETLIST

      const newActiveSetIndex: number = activeSetIndex + 1;
      if (activeSetIndex < sets.length) {
        setActiveSetIndex(newActiveSetIndex);
        setActiveSet(sets[newActiveSetIndex]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (workout === undefined) return NotFound();

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
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
                          onClick={() => handleExercisePressed(exercise)}
                        >
                          <span className="text-md">{exercise.name}</span>
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
                        <h2 className="text-2xl font-semibold px-1">
                          {selectedExercise.name}
                        </h2>
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          onPress={() => setSelectedExercise(undefined)}
                        >
                          Change Exercise
                        </Button>
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
                      {!isEditingSet && (
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
                  onPress={handleSaveSetButtonPressed}
                >
                  {isEditingSet ? "Save" : "Add"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Set
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete {setToDelete?.exercise_name}{" "}
                  Set from Workout?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={deleteSet}>
                  Delete
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
            <div className="flex justify-center">
              <h1 className="text-2xl font-semibold">{workoutDate}</h1>
            </div>
            <div className="flex flex-row justify-between gap-2 items-center">
              <Input
                value={workoutNote}
                label="Workout Note"
                variant="faded"
                size="sm"
                onValueChange={(value) => setWorkoutNote(value)}
                isClearable
              />
              <Button color="success" onPress={handleSaveNoteButtonPressed}>
                Save
              </Button>
            </div>
            <div className="flex flex-col gap-2">
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
                    >
                      <div className="flex gap-2 justify-between items-center">
                        <span>{set.exercise_name}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            color="primary"
                            onPress={() => handleEditButtonPressed(set)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onPress={() => handleDeleteButtonPress(set)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
              <div className="flex justify-center">
                <Button color="success" onPress={handleAddSetButtonPressed}>
                  Add Set
                </Button>
              </div>
              {activeSet !== undefined && (
                <div>
                  <Card>
                    <CardHeader className="justify-between">
                      <h2>{activeSet.exercise_name}</h2>
                    </CardHeader>
                    <CardBody className="px-3 py-0 text-small text-default-400">
                      <div>
                        {!!activeSet.is_tracking_weight && (
                          <div className="flex justify-between gap-2">
                            <Input
                              value={setTrackingValuesInput.weight}
                              label="Weight"
                              size="sm"
                              variant="faded"
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
                              actionSet={setActiveSet as SetWorkoutSetAction}
                              targetType="set"
                            />
                          </div>
                        )}
                        {!!activeSet.is_tracking_reps && (
                          <Input
                            value={setTrackingValuesInput.reps}
                            label="Reps"
                            size="sm"
                            variant="faded"
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
                          <div className="flex justify-between gap-2">
                            <Input
                              value={setTrackingValuesInput.distance}
                              label="Distance"
                              size="sm"
                              variant="faded"
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
                              actionSet={setActiveSet as SetWorkoutSetAction}
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
                            value={setTrackingValuesInput.rir}
                            label="RIR"
                            size="sm"
                            variant="faded"
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
                            value={setTrackingValuesInput.rpe}
                            label="RPE"
                            size="sm"
                            variant="faded"
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
                            value={setTrackingValuesInput.resistance_level}
                            label="Resistance Level"
                            size="sm"
                            variant="faded"
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
                      </div>
                    </CardBody>
                    <CardFooter className="flex justify-end">
                      <Button
                        color="success"
                        isDisabled={isSetTrackingInputsInvalid}
                        onPress={saveActiveSet}
                      >
                        Save
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

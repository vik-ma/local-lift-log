import { useParams } from "react-router-dom";
import {
  ExerciseWithGroupString,
  UserSettings,
  WorkoutSet,
  WorkoutTemplate,
  SetWorkoutSetAction,
  SetTrackingValuesInput,
} from "../typings";
import { useState, useMemo, useEffect } from "react";
import {
  Button,
  Input,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  ScrollShadow,
  Checkbox,
} from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import {
  WeightUnitDropdown,
  DistanceUnitDropdown,
  LoadingSpinner,
  TimeInput,
} from "../components";
import { NotFound } from ".";
import toast, { Toaster } from "react-hot-toast";
import {
  ConvertSetInputValuesToNumbers,
  DefaultNewSet,
  DefaultSetInputValues,
  GenerateSetListOrderString,
  GetExerciseListWithGroupStrings,
  GetUserSettings,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove10,
  OrderSetsBySetListOrderString,
} from "../helpers";
import { SearchIcon } from "../assets";
import { Reorder } from "framer-motion";

export default function WorkoutTemplateDetails() {
  const { id } = useParams();
  const [workoutTemplate, setWorkoutTemplate] = useState<WorkoutTemplate>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newWorkoutTemplateName, setNewWorkoutTemplateName] =
    useState<string>("");
  const [newWorkoutTemplateNote, setNewWorkoutTemplateNote] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [exercises, setExercises] = useState<ExerciseWithGroupString[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseWithGroupString>();
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [numNewSets, setNumNewSets] = useState<string>("1");
  const [isEditingSet, setIsEditingSet] = useState<boolean>(false);
  const [isEditingDefaultValues, setIsEditingDefaultValues] =
    useState<boolean>(false);
  const [isTimeInputInvalid, setIsTimeInputInvalid] = useState<boolean>(false);

  const defaultSetTrackingValuesInput: SetTrackingValuesInput =
    DefaultSetInputValues();

  const [setTrackingValuesInput, setSetTrackingValuesInput] =
    useState<SetTrackingValuesInput>(defaultSetTrackingValuesInput);

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

  const defaultNewSet: WorkoutSet = DefaultNewSet(true);

  const [operatingSet, setOperatingSet] = useState<WorkoutSet>(defaultNewSet);

  const newSetModal = useDisclosure();
  const defaultValuesModal = useDisclosure();
  const supersetModal = useDisclosure();
  const dropsetModal = useDisclosure();

  const isNewWorkoutTemplateNameInvalid = useMemo(() => {
    return (
      newWorkoutTemplateName === null ||
      newWorkoutTemplateName === undefined ||
      newWorkoutTemplateName.trim().length === 0
    );
  }, [newWorkoutTemplateName]);

  useEffect(() => {
    const getWorkoutTemplateAndSetList = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<WorkoutTemplate[]>(
          "SELECT * FROM workout_templates WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const workoutTemplate: WorkoutTemplate = result[0];

        const setList = await db.select<WorkoutSet[]>(
          `SELECT sets.*, exercises.name AS exercise_name
          FROM sets 
          JOIN exercises ON sets.exercise_id = exercises.id 
          WHERE workout_template_id = $1 AND is_template = 1`,
          [id]
        );

        const orderedSetList: WorkoutSet[] = OrderSetsBySetListOrderString(
          setList,
          workoutTemplate.set_list_order
        );

        setWorkoutTemplate(workoutTemplate);
        setNewWorkoutTemplateName(workoutTemplate.name);
        setNewWorkoutTemplateNote(workoutTemplate.note ?? "");
        setSets(orderedSetList);
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

    getWorkoutTemplateAndSetList();
    loadUserSettings();
    getExerciseList();
  }, [id]);

  const updateWorkoutTemplateNoteAndName = async () => {
    if (isNewWorkoutTemplateNameInvalid) return;

    try {
      if (workoutTemplate === undefined) return;

      const noteToInsert: string | null =
        newWorkoutTemplateNote.trim().length === 0
          ? null
          : newWorkoutTemplateNote;

      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE workout_templates SET name = $1, note = $2 WHERE id = $3",
        [newWorkoutTemplateName, noteToInsert, workoutTemplate.id]
      );

      setWorkoutTemplate((prev) => ({
        ...prev!,
        name: newWorkoutTemplateName,
        note: newWorkoutTemplateNote,
      }));

      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const addSet = async () => {
    if (selectedExercise === undefined || workoutTemplate === undefined) return;

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
            is_tracking_resistance_level, weight_unit, distance_unit, is_superset, is_dropset) 
          VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
            $21, $22, $23, $24, $25)`,
          [
            operatingSet.workout_id,
            selectedExercise.id,
            operatingSet.is_template,
            workoutTemplate.id,
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
            0,
            0,
          ]
        );

        const newSet: WorkoutSet = {
          ...operatingSet,
          id: result.lastInsertId,
          exercise_id: selectedExercise.id,
          workout_template_id: workoutTemplate.id,
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

  const removeSet = async (set: WorkoutSet) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from sets WHERE id = $1", [set.id]);

      const updatedSetList: WorkoutSet[] = sets.filter(
        (item) => item.id !== set.id
      );
      setSets(updatedSetList);
      await updateSetListOrder(updatedSetList);

      toast.success("Set Removed");
    } catch (error) {
      console.log(error);
    }
  };

  const updateSet = async () => {
    if (selectedExercise === undefined || workoutTemplate === undefined) return;

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

  const updateSetListOrder = async (setList: WorkoutSet[] = sets) => {
    if (workoutTemplate === undefined) return;

    const setListOrderString: string = GenerateSetListOrderString(setList);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        `UPDATE workout_templates SET set_list_order = $1 WHERE id = $2`,
        [setListOrderString, workoutTemplate.id]
      );
    } catch (error) {
      console.log(error);
    }
  };

  const updateSetDefaultValues = async () => {
    if (workoutTemplate === undefined) return;

    if (isSetDefaultValuesInvalid) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      setTrackingValuesInput
    );

    try {
      const db = await Database.load(import.meta.env.VITE_DB);
      await db.execute(
        `UPDATE sets SET
        weight = $1, reps = $2, distance = $3, time_in_seconds = $4, rir = $5,
        rpe = $6, resistance_level = $7, weight_unit = $8, distance_unit = $9
        WHERE id = $10`,
        [
          setTrackingValuesNumber.weight,
          setTrackingValuesNumber.reps,
          setTrackingValuesNumber.distance,
          operatingSet.time_in_seconds,
          setTrackingValuesNumber.rir,
          setTrackingValuesNumber.rpe,
          setTrackingValuesNumber.resistance_level,
          operatingSet.weight_unit,
          operatingSet.distance_unit,
          operatingSet.id,
        ]
      );

      const newSet: WorkoutSet = {
        ...operatingSet,
        weight: setTrackingValuesNumber.weight,
        reps: setTrackingValuesNumber.reps,
        distance: setTrackingValuesNumber.distance,
        rir: setTrackingValuesNumber.rir,
        rpe: setTrackingValuesNumber.rpe,
        resistance_level: setTrackingValuesNumber.resistance_level,
      };

      setSets((prev) =>
        prev.map((item) => (item.id === operatingSet.id ? newSet : item))
      );

      resetSetToDefault();
      defaultValuesModal.onClose();
      toast.success("Default Values Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const resetSetToDefault = () => {
    setIsEditingSet(false);
    setIsEditingDefaultValues(false);
    setSelectedExercise(undefined);
    setOperatingSet({
      ...defaultNewSet,
      weight_unit: userSettings!.default_unit_weight!,
      distance_unit: userSettings!.default_unit_distance!,
    });
  };

  const handleSaveSetButton = async () => {
    if (isEditingSet) {
      await updateSet();
    } else {
      await addSet();
    }
  };

  const handleAddSetButton = () => {
    if (isEditingSet || isEditingDefaultValues) {
      resetSetToDefault();
    }

    newSetModal.onOpen();
  };

  const handleEditButton = (set: WorkoutSet) => {
    const exercise = exercises.find((item) => item.id === set.exercise_id);

    if (exercise === undefined) return;

    setOperatingSet(set);
    setIsEditingSet(true);
    setIsEditingDefaultValues(false);
    setSelectedExercise(exercise);

    newSetModal.onOpen();
  };

  const setDefaultValuesInputStrings = (set: WorkoutSet) => {
    const newSetTrackingValuesInput = {
      weight:
        set.is_tracking_weight && set.weight !== 0 ? set.weight.toString() : "",
      reps: set.is_tracking_reps && set.reps !== 0 ? set.reps.toString() : "",
      rir: set.is_tracking_rir && set.rir !== 0 ? set.rir.toString() : "",
      rpe: set.is_tracking_rpe && set.rpe !== 0 ? set.rpe.toString() : "",
      distance:
        set.is_tracking_distance && set.distance !== 0
          ? set.distance.toString()
          : "",
      resistance_level:
        set.is_tracking_resistance_level && set.resistance_level !== 0
          ? set.resistance_level.toString()
          : "",
    };
    setSetTrackingValuesInput(newSetTrackingValuesInput);
  };

  const handleSetDefaultValuesButton = (set: WorkoutSet) => {
    const exercise = exercises.find((item) => item.id === set.exercise_id);

    if (exercise === undefined) return;

    setOperatingSet(set);
    setIsEditingDefaultValues(true);
    setIsEditingSet(false);
    setSelectedExercise(exercise);
    setDefaultValuesInputStrings(set);

    defaultValuesModal.onOpen();
  };

  const handleClickExercise = (exercise: ExerciseWithGroupString) => {
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

  const isDefaultWeightInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(setTrackingValuesInput.weight);
  }, [setTrackingValuesInput.weight]);

  const isDefaultRepsInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(setTrackingValuesInput.reps);
  }, [setTrackingValuesInput.reps]);

  const isDefaultDistanceInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(setTrackingValuesInput.distance);
  }, [setTrackingValuesInput.distance]);

  const isDefaultRirInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(setTrackingValuesInput.rir);
  }, [setTrackingValuesInput.rir]);

  const isDefaultRpeInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOrAbove10(setTrackingValuesInput.rpe);
  }, [setTrackingValuesInput.rpe]);

  const isDefaultResistanceLevelInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(setTrackingValuesInput.resistance_level);
  }, [setTrackingValuesInput.resistance_level]);

  const isSetDefaultValuesInvalid = useMemo(() => {
    if (isDefaultWeightInputInvalid) return true;
    if (isDefaultRepsInputInvalid) return true;
    if (isDefaultDistanceInputInvalid) return true;
    if (isTimeInputInvalid) return true;
    if (isDefaultRirInputInvalid) return true;
    if (isDefaultRpeInputInvalid) return true;
    if (isDefaultResistanceLevelInputInvalid) return true;
    return false;
  }, [
    isDefaultWeightInputInvalid,
    isDefaultRepsInputInvalid,
    isDefaultDistanceInputInvalid,
    isTimeInputInvalid,
    isDefaultRirInputInvalid,
    isDefaultRpeInputInvalid,
    isDefaultResistanceLevelInputInvalid,
  ]);

  if (workoutTemplate === undefined) return NotFound();

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
                  onPress={handleSaveSetButton}
                >
                  {isEditingSet ? "Save" : "Add"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={defaultValuesModal.isOpen}
        onOpenChange={defaultValuesModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Set Default Values
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-semibold">
                    {selectedExercise?.name}
                  </h2>
                  <div className="flex flex-wrap gap-1.5 justify-evenly">
                    {!!operatingSet.is_tracking_weight && (
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
                          isInvalid={isDefaultWeightInputInvalid}
                          isClearable
                        />
                        <WeightUnitDropdown
                          value={operatingSet.weight_unit}
                          setSet={setOperatingSet as SetWorkoutSetAction}
                          targetType="set"
                        />
                      </div>
                    )}
                    {!!operatingSet.is_tracking_reps && (
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
                        isInvalid={isDefaultRepsInputInvalid}
                        isClearable
                      />
                    )}
                    {!!operatingSet.is_tracking_distance && (
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
                          isInvalid={isDefaultDistanceInputInvalid}
                          isClearable
                        />
                        <DistanceUnitDropdown
                          value={operatingSet.distance_unit}
                          setSet={setOperatingSet as SetWorkoutSetAction}
                          targetType="set"
                        />
                      </div>
                    )}
                    {!!operatingSet.is_tracking_time && (
                      <TimeInput
                        value={operatingSet}
                        setValue={setOperatingSet}
                        defaultTimeInput={userSettings!.default_time_input!}
                        setIsInvalid={setIsTimeInputInvalid}
                      />
                    )}
                    {!!operatingSet.is_tracking_rir && (
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
                        isInvalid={isDefaultRirInputInvalid}
                        isClearable
                      />
                    )}
                    {!!operatingSet.is_tracking_rpe && (
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
                        isInvalid={isDefaultRpeInputInvalid}
                        isClearable
                      />
                    )}
                    {!!operatingSet.is_tracking_resistance_level && (
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
                        isInvalid={isDefaultResistanceLevelInputInvalid}
                        isClearable
                      />
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  onPress={updateSetDefaultValues}
                  isDisabled={isSetDefaultValuesInvalid}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={supersetModal.isOpen}
        onOpenChange={supersetModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Superset
              </ModalHeader>
              <ModalBody></ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="success">Add</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={dropsetModal.isOpen}
        onOpenChange={dropsetModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Dropset</ModalHeader>
              <ModalBody></ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="success">Add</Button>
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
            <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
              <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
                {workoutTemplate.name}
              </h1>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Note</h2>
              <span>{workoutTemplate?.note}</span>
            </div>
            {isEditing ? (
              <div className="flex flex-col justify-center gap-2">
                <Input
                  value={newWorkoutTemplateName}
                  isInvalid={isNewWorkoutTemplateNameInvalid}
                  label="Name"
                  errorMessage={
                    isNewWorkoutTemplateNameInvalid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={(value) => setNewWorkoutTemplateName(value)}
                  isRequired
                  isClearable
                />
                <Input
                  value={newWorkoutTemplateNote!}
                  label="Note"
                  variant="faded"
                  onValueChange={(value) => setNewWorkoutTemplateNote(value)}
                  isClearable
                />
                <div className="flex justify-center gap-4">
                  <Button color="danger" onPress={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    color="success"
                    onPress={updateWorkoutTemplateNoteAndName}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button color="primary" onPress={() => setIsEditing(true)}>
                  Edit
                </Button>
              </div>
            )}
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
                  className="flex flex-col gap-1.5"
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
                        <span className="truncate">{set.exercise_name}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            color="primary"
                            onPress={() =>
                              handleSetDefaultValuesButton(set)
                            }
                          >
                            Set Default Values
                          </Button>
                          <Button
                            size="sm"
                            color="primary"
                            onPress={() => handleEditButton(set)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            onPress={() => removeSet(set)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
              <div className="flex gap-1 justify-center">
                <Button color="success" onPress={handleAddSetButton}>
                  Add Set
                </Button>
                <Button color="success" onPress={() => supersetModal.onOpen()}>
                  Add Superset
                </Button>
                <Button color="success" onPress={() => dropsetModal.onOpen()}>
                  Add Dropset
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

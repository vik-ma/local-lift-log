import { useParams } from "react-router-dom";
import {
  ExerciseWithGroupString,
  UserSettings,
  WorkoutSet,
  WorkoutTemplate,
  SetWorkoutSetAction,
  SetTrackingValuesInput,
  GroupedWorkoutSet,
  SetListNotes,
  SetListOptionsItem,
} from "../typings";
import { useState, useMemo, useEffect, useCallback } from "react";
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import {
  WeightUnitDropdown,
  DistanceUnitDropdown,
  LoadingSpinner,
  TimeInput,
  SetList,
} from "../components";
import { NotFound } from ".";
import toast, { Toaster } from "react-hot-toast";
import {
  ConvertSetInputValuesToNumbers,
  CreateGroupedWorkoutSetListByExerciseId,
  DefaultNewSet,
  DefaultSetInputValues,
  GenerateExerciseOrderString,
  GetExerciseListWithGroupStrings,
  GetUserSettings,
  InsertSetIntoDatabase,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove10,
  ReassignExerciseIdForSets,
  UpdateSet,
} from "../helpers";
import { ChevronIcon, SearchIcon, VerticalMenuIcon } from "../assets";
import { Reorder } from "framer-motion";

type OperationType =
  | "add"
  | "edit"
  | "remove-set"
  | "change-exercise"
  | "reassign-exercise"
  | "delete-exercise-sets";

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
  const [groupedSets, setGroupedSets] = useState<GroupedWorkoutSet[]>([]);
  const [numNewSets, setNumNewSets] = useState<string>("1");
  const [isTimeInputInvalid, setIsTimeInputInvalid] = useState<boolean>(false);
  const [operationType, setOperationType] = useState<OperationType>("add");
  const [operatingGroupedSet, setOperatingGroupedSet] =
    useState<GroupedWorkoutSet>();
  const [shownSetListNotes, setShownSetListNotes] = useState<SetListNotes>({});
  const [showDefaultValues, setShowDefaultValues] = useState<boolean>(false);

  const defaultSetTrackingValuesInput: SetTrackingValuesInput =
    DefaultSetInputValues();

  const [setTrackingValuesInput, setSetTrackingValuesInput] =
    useState<SetTrackingValuesInput>(defaultSetTrackingValuesInput);

  const numSetsOptions: string[] = ["1", "2", "3", "4", "5", "6"];

  const setListOptionsMenu: SetListOptionsItem[] = [
    { key: "edit", label: "Edit" },
    { key: "remove-set", label: "Remove", className: "text-danger" },
  ];

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

  const setModal = useDisclosure();
  const deleteModal = useDisclosure();

  const isNewWorkoutTemplateNameInvalid = useMemo(() => {
    return (
      newWorkoutTemplateName === null ||
      newWorkoutTemplateName === undefined ||
      newWorkoutTemplateName.trim().length === 0
    );
  }, [newWorkoutTemplateName]);

  const getWorkoutTemplateAndSetList = useCallback(async () => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const result = await db.select<WorkoutTemplate[]>(
        "SELECT * FROM workout_templates WHERE id = $1",
        [id]
      );

      if (result.length === 0) return;

      const workoutTemplate: WorkoutTemplate = result[0];

      const setList = await db.select<WorkoutSet[]>(
        `SELECT sets.*, 
        COALESCE(exercises.name, 'Unknown Exercise') AS exercise_name,
        COALESCE(exercises.note, NULL) AS exercise_note
        FROM sets LEFT JOIN 
        exercises ON sets.exercise_id = exercises.id 
        WHERE workout_template_id = $1 AND is_template = 1`,
        [id]
      );

      const groupedSetList: GroupedWorkoutSet[] =
        CreateGroupedWorkoutSetListByExerciseId(
          setList,
          workoutTemplate.exercise_order
        );

      for (let i = 0; i < groupedSetList.length; i++) {
        groupedSetList[i].showExerciseNote = true;
      }

      setWorkoutTemplate(workoutTemplate);
      setNewWorkoutTemplateName(workoutTemplate.name);
      setNewWorkoutTemplateNote(workoutTemplate.note ?? "");
      setGroupedSets(groupedSetList);
    } catch (error) {
      console.log(error);
    }
  }, [id]);

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

    const getExerciseList = async () => {
      const exercises = await GetExerciseListWithGroupStrings();
      if (exercises !== undefined) setExercises(exercises);
      setIsLoading(false);
    };

    getWorkoutTemplateAndSetList();
    loadUserSettings();
    getExerciseList();
  }, [id, getWorkoutTemplateAndSetList]);

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

    if (isSetDefaultValuesInvalid) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      setTrackingValuesInput
    );

    try {
      const noteToInsert: string | null =
        operatingSet.note?.trim().length === 0 ? null : operatingSet.note;

      const newSets: WorkoutSet[] = [];

      const numSetsToAdd: number = parseInt(numNewSets);

      for (let i = 0; i < numSetsToAdd; i++) {
        const newSet: WorkoutSet = {
          ...operatingSet,
          exercise_id: selectedExercise.id,
          workout_template_id: workoutTemplate.id,
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
        (obj) => obj.exercise_id === selectedExercise.id
      );

      if (exerciseIndex === -1) {
        // Create new GroupedWorkoutSet if exercise_id does not exist in groupedSets
        const newGroupedWorkoutSet: GroupedWorkoutSet = {
          exercise_name: selectedExercise.name,
          exercise_id: selectedExercise.id,
          setList: newSets,
          exercise_note: selectedExercise.note,
          isExpanded: true,
          showExerciseNote: true,
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

      setModal.onClose();
      toast.success("Set Added");
    } catch (error) {
      console.log(error);
    }
  };

  const removeSet = async () => {
    if (operatingSet === undefined || operationType !== "remove-set") return;

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

      const setIndex: number = operatingSet.set_index! - 1;

      // Close shownSetListNotes for Set if note was deleted
      if (
        shownSetListNotes[operatingSet.exercise_id] &&
        shownSetListNotes[operatingSet.exercise_id].has(setIndex)
      ) {
        updateShownSetListNotes(operatingSet.exercise_id, setIndex);
      }

      resetSetToDefault();

      toast.success("Set Removed");
      deleteModal.onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const updateSet = async () => {
    if (selectedExercise === undefined) return;

    if (isSetDefaultValuesInvalid) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      setTrackingValuesInput
    );

    const noteToInsert: string | null =
      operatingSet.note?.trim().length === 0 ? null : operatingSet.note;

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
      (obj) => obj.exercise_id === operatingSet.exercise_id
    );

    const updatedSetList: WorkoutSet[] = [];

    let setIndex: number = 0;

    for (let i = 0; i < groupedSets[exerciseIndex].setList.length; i++) {
      if (groupedSets[exerciseIndex].setList[i].id === operatingSet.id) {
        updatedSetList.push(updatedSet);
        setIndex = i;
      } else {
        updatedSetList.push(groupedSets[exerciseIndex].setList[i]);
      }
    }

    // Close shownSetListNotes for Set if note was deleted
    if (
      noteToInsert === null &&
      shownSetListNotes[operatingSet.exercise_id] &&
      shownSetListNotes[operatingSet.exercise_id].has(setIndex)
    ) {
      updateShownSetListNotes(operatingSet.exercise_id, setIndex);
    }

    setGroupedSets((prev) => {
      const newList = [...prev];
      newList[exerciseIndex].setList = updatedSetList;
      return newList;
    });

    resetSetToDefault();

    setModal.onClose();
    toast.success("Set Updated");
  };

  const updateExerciseOrder = async (
    setList: GroupedWorkoutSet[] = groupedSets
  ) => {
    if (workoutTemplate === undefined) return;

    const exerciseOrderString: string = GenerateExerciseOrderString(setList);

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        `UPDATE workout_templates SET exercise_order = $1 WHERE id = $2`,
        [exerciseOrderString, workoutTemplate.id]
      );
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
    setSetTrackingValuesInput(defaultSetTrackingValuesInput);
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

    setModal.onOpen();
  };

  const handleEditSet = (set: WorkoutSet, index: number) => {
    const exercise = exercises.find((item) => item.id === set.exercise_id);

    if (exercise === undefined) return;

    setOperatingSet({ ...set, set_index: index });
    setOperationType("edit");
    setSelectedExercise(exercise);
    setDefaultValuesInputStrings(set);

    setModal.onOpen();
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

  const handleClickExercise = (exercise: ExerciseWithGroupString) => {
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

  const reassignExercise = async (newExercise: ExerciseWithGroupString) => {
    if (operatingGroupedSet === undefined || workoutTemplate === undefined)
      return;

    const oldExerciseIndex: number = groupedSets.findIndex(
      (obj) => obj.exercise_id === operatingGroupedSet.exercise_id
    );

    if (operationType === "reassign-exercise") {
      // Reassign ALL sets with old exercise_id to new exercise_id
      await ReassignExerciseIdForSets(
        operatingGroupedSet.exercise_id,
        newExercise.id
      );
    } else if (operationType === "change-exercise") {
      // Just change the sets with this specific workout_template_id
      try {
        const db = await Database.load(import.meta.env.VITE_DB);
        await db.execute(
          `UPDATE sets SET exercise_id = $1 
          WHERE exercise_id = $2 AND workout_template_id = $3 AND is_template = 1`,
          [newExercise.id, operatingGroupedSet.exercise_id, workoutTemplate.id]
        );
      } catch (error) {
        console.log(error);
        return;
      }
    } else return;

    const newGroupedWorkoutSet: GroupedWorkoutSet = {
      ...operatingGroupedSet,
      exercise_name: newExercise.name,
      exercise_id: newExercise.id,
      exercise_note: newExercise.note,
    };

    const newExerciseIndex: number = groupedSets.findIndex(
      (obj) => obj.exercise_id === newExercise.id
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

  const handleReassignExercise = (groupedWorkoutSet: GroupedWorkoutSet) => {
    setSelectedExercise(undefined);
    setOperationType("reassign-exercise");
    setOperatingGroupedSet(groupedWorkoutSet);

    setModal.onOpen();
  };

  const handleChangeExercise = (groupedWorkoutSet: GroupedWorkoutSet) => {
    setSelectedExercise(undefined);
    setOperationType("change-exercise");
    setOperatingGroupedSet(groupedWorkoutSet);

    setModal.onOpen();
  };

  const handleClickSet = (set: WorkoutSet, index: number) => {
    handleEditSet(set, index + 1);
  };

  const handleSetOptionSelection = (
    key: string,
    set: WorkoutSet,
    index: number
  ) => {
    if (key === "edit") {
      handleEditSet(set, index + 1);
    } else if (key === "remove-set") {
      handleRemoveSet(set);
    }
  };

  const handleRemoveSet = (set: WorkoutSet) => {
    setOperatingSet(set);
    setOperationType("remove-set");

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
    const exercise = exercises.find(
      (obj) => obj.id === groupedWorkoutSet.exercise_id
    );

    if (exercise === undefined || workoutTemplate === undefined) return;

    let newSet: WorkoutSet = {
      ...defaultNewSet,
      exercise_id: exercise.id,
      workout_template_id: workoutTemplate.id,
      weight_unit: userSettings!.default_unit_weight!,
      distance_unit: userSettings!.default_unit_distance!,
      exercise_name: exercise.name,
    };

    if (exercise.exercise_group_string === "Cardio") {
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
    console.log(setId);
    if (setId === 0) return;

    newSet = { ...newSet, id: setId };
    const newSets: WorkoutSet[] = [newSet];

    const exerciseIndex: number = groupedSets.findIndex(
      (obj) => obj.exercise_id === exercise.id
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
      workoutTemplate === undefined ||
      operatingGroupedSet === undefined ||
      operationType !== "delete-exercise-sets"
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute(
        `DELETE from sets WHERE exercise_id = $1 
         AND workout_template_id = $2 
         AND is_template = 1`,
        [operatingGroupedSet.exercise_id, workoutTemplate.id]
      );

      const updatedSetList: GroupedWorkoutSet[] = groupedSets.filter(
        (item) => item.exercise_id !== operatingGroupedSet.exercise_id
      );

      setGroupedSets(updatedSetList);

      updateExerciseOrder(updatedSetList);

      resetSetToDefault();

      deleteModal.onClose();
      toast.success("Sets Removed");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteModalButton = () => {
    if (operationType === "delete-exercise-sets") {
      deleteAllSetsForExerciseId();
    } else if (operationType === "remove-set") {
      removeSet();
    }
  };

  const handleToggleExerciseNote = (groupedWorkoutSet: GroupedWorkoutSet) => {
    const updatedGroupedSet: GroupedWorkoutSet = {
      ...groupedWorkoutSet,
      showExerciseNote: !groupedWorkoutSet.showExerciseNote,
    };

    setGroupedSets((prev) =>
      prev.map((item) =>
        item.exercise_id === groupedWorkoutSet.exercise_id
          ? updatedGroupedSet
          : item
      )
    );
  };

  const updateShownSetListNotes = (exerciseId: number, index: number) => {
    let updatedSet: Set<number> = new Set<number>();
    if (shownSetListNotes[exerciseId]) {
      // If shownSetListNotes HAS key for exerciseId
      updatedSet = new Set(shownSetListNotes[exerciseId]);

      if (shownSetListNotes[exerciseId].has(index)) {
        updatedSet.delete(index);
      } else {
        updatedSet.add(index);
      }
    } else {
      // If shownSetListNotes HAS NO key for exerciseId
      updatedSet.add(index);
    }

    setShownSetListNotes((prev) => ({
      ...prev,
      [exerciseId]: updatedSet,
    }));
  };

  const handleExerciseAccordionClick = (groupedSet: GroupedWorkoutSet) => {
    const updatedGroupedSet: GroupedWorkoutSet = {
      ...groupedSet,
      isExpanded: !groupedSet.isExpanded,
    };

    setGroupedSets((prev) =>
      prev.map((item) =>
        item.exercise_id === groupedSet.exercise_id ? updatedGroupedSet : item
      )
    );
  };

  if (workoutTemplate === undefined) return NotFound();

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
                Remove Set{operationType === "delete-exercise-sets" && "s"}
              </ModalHeader>
              <ModalBody>
                <p className="break-words">
                  {operationType === "delete-exercise-sets"
                    ? `Are you sure you want to remove all ${operatingGroupedSet?.exercise_name} sets from Workout Template?`
                    : `Are you sure you want to remove ${operatingSet.exercise_name} set?`}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={handleDeleteModalButton}>
                  Remove
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal isOpen={setModal.isOpen} onOpenChange={setModal.onOpenChange}>
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
                  <div className="flex flex-col gap-2 h-[400px]">
                    <div className="flex flex-row items-center justify-between">
                      <h2 className="flex text-2xl font-semibold justify-between w-full items-end">
                        <span className="text-yellow-600 truncate max-w-[21rem]">
                          {selectedExercise.name}
                        </span>{" "}
                        {operationType === "edit" && (
                          <span className="text-lg text-stone-500">
                            Set {operatingSet.set_index}
                          </span>
                        )}
                      </h2>
                    </div>
                    <ScrollShadow className="flex flex-col gap-2 h-full">
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
                      <h3 className="text-xl font-semibold px-0.5">Track</h3>
                      <div className="grid grid-cols-2 gap-1.5 px-1">
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
                            size="sm"
                            variant="faded"
                            selectedKeys={[numNewSets]}
                            onChange={(e) => setNumNewSets(e.target.value)}
                            disallowEmptySelection
                          >
                            {numSetsOptions.map((num) => (
                              <SelectItem key={num} value={num}>
                                {num}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      )}
                      <div className="flex gap-2.5 items-center px-0.5">
                        <h3 className="text-xl font-semibold">
                          Default Values
                        </h3>
                        <Button
                          variant="flat"
                          size="sm"
                          onPress={() =>
                            setShowDefaultValues(!showDefaultValues)
                          }
                        >
                          {showDefaultValues ? "Hide" : "Show"}
                        </Button>
                      </div>
                      {showDefaultValues && (
                        <div className="flex flex-wrap gap-1.5 px-1 justify-evenly">
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
                              defaultTimeInput={
                                userSettings!.default_time_input!
                              }
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
                      )}
                    </ScrollShadow>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  isDisabled={
                    selectedExercise === undefined || isSetDefaultValuesInvalid
                  }
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
                {groupedSets.length > 1 && (
                  <span className="text-xs italic text-stone-500 font-normal">
                    Drag Exercises To Reorder Set List
                  </span>
                )}
              </h2>
              <div className="flex flex-col gap-1">
                <Reorder.Group
                  className="flex flex-col gap-1.5"
                  values={groupedSets}
                  onReorder={setGroupedSets}
                >
                  {groupedSets.map((exercise) => (
                    <Reorder.Item
                      key={exercise.exercise_id}
                      value={exercise}
                      onDragEnd={() => updateExerciseOrder()}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="bg-white rounded-lg border border-stone-300 overflow-hidden">
                        <div
                          className="flex justify-between pl-2 py-1 h-14 w-full rounded-lg cursor-pointer hover:bg-stone-100"
                          onClick={() => handleExerciseAccordionClick(exercise)}
                        >
                          <div className="flex flex-col items-start">
                            <h3
                              className={
                                exercise.exercise_name === "Unknown Exercise"
                                  ? "text-lg font-medium truncate max-w-80 text-red-500"
                                  : "text-lg font-medium truncate max-w-80 text-yellow-600"
                              }
                            >
                              {exercise.exercise_name}
                            </h3>
                            <span className="text-sm text-stone-500">
                              {exercise.setList.length} Sets
                            </span>
                          </div>
                          <div className="flex gap-0.5 px-0.5 items-center">
                            <ChevronIcon
                              size={27}
                              color="#a8a29e"
                              direction={exercise.isExpanded ? "down" : "left"}
                            />
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                  <VerticalMenuIcon color="#a8a29e" size={17} />
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
                                <DropdownItem
                                  className={
                                    exercise.exercise_note === null
                                      ? "hidden"
                                      : ""
                                  }
                                  key="toggle-exercise-note"
                                >
                                  {exercise.showExerciseNote
                                    ? "Hide Exercise Note"
                                    : "Show Exercise Note"}
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
                                  Remove All Sets
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </div>
                        {exercise.isExpanded && (
                          <div className="flex flex-col divide-y divide-stone-200">
                            {exercise.showExerciseNote && (
                              <div className="flex justify-between items-center px-2 pb-1">
                                <span className="text-stone-400 break-words max-w-full">
                                  {exercise.exercise_note}
                                </span>
                              </div>
                            )}
                            <SetList
                              exercise={exercise}
                              activeSetId={0}
                              clickSetAction={handleClickSet}
                              optionsSelectionAction={handleSetOptionSelection}
                              clickCommentButtonAction={updateShownSetListNotes}
                              shownSetListComments={shownSetListNotes}
                              isTemplate={true}
                              setListOptionsMenu={setListOptionsMenu}
                            />
                          </div>
                        )}
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
              <div className="flex gap-1 justify-center">
                <Button color="success" onPress={handleAddSetButton}>
                  Add Set
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

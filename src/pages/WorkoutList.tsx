import { useState, useEffect, useRef } from "react";
import { Routine, UserSettings, Workout, WorkoutTemplate } from "../typings";
import { useNavigate } from "react-router-dom";
import {
  LoadingSpinner,
  DeleteModal,
  WorkoutModal,
  EmptyListLabel,
  ListPageSearchInput,
  WorkoutTemplateListModal,
  WorkoutListItem,
  WorkoutListOptions,
  RoutineListModal,
  FilterWorkoutListModal,
  ListFilters,
  FilterExerciseGroupsModal,
  FilterWorkoutTemplateListModal,
  FilterRoutineListModal,
} from "../components";
import Database from "@tauri-apps/plugin-sql";
import { Button, useDisclosure } from "@heroui/react";
import toast from "react-hot-toast";
import {
  DeleteMultisetWithId,
  DeleteWorkoutWithId,
  GetUniqueMultisetIds,
  GetUserSettings,
  LoadStore,
  UpdateItemInList,
  UpdateWorkout,
  ValidateAndModifyUserSettings,
} from "../helpers";
import { useExerciseList, useWorkoutList } from "../hooks";
import { GoToArrowIcon } from "../assets";
import { Store } from "@tauri-apps/plugin-store";
import { DEFAULT_WORKOUT } from "../constants";

type OperationType =
  | "edit"
  | "delete"
  | "delete-empty-workouts"
  | "reassign-workout-template"
  | "reassign-routine";

export default function WorkoutList() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("edit");
  const [operatingWorkout, setOperatingWorkout] =
    useState<Workout>(DEFAULT_WORKOUT);

  const store = useRef<Store>(null);

  const navigate = useNavigate();

  const deleteModal = useDisclosure();
  const workoutModal = useDisclosure();

  const exerciseList = useExerciseList({ store: store });

  const workoutList = useWorkoutList({
    store: store,
    useExerciseList: exerciseList,
  });

  const {
    workouts,
    setWorkouts,
    filterQuery,
    setFilterQuery,
    filteredWorkouts,
    listFilters,
    workoutTemplateList,
    routineList,
    isWorkoutListLoaded,
    workoutListHasEmptyWorkouts,
    loadWorkoutList,
    sortWorkoutsByActiveCategory,
    selectedWorkoutProperties,
    setSelectedWorkoutProperties,
  } = workoutList;

  const { filterMap } = listFilters;

  const { handleOpenWorkoutTemplateListModal, workoutTemplateListModal } =
    workoutTemplateList;

  useEffect(() => {
    const loadPage = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      ValidateAndModifyUserSettings(
        userSettings,
        new Set(["locale", "pagination_items"])
      );

      setUserSettings(userSettings);

      await LoadStore(store);

      await loadWorkoutList(userSettings);
    };

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteWorkout = async (workoutToDelete?: Workout) => {
    const workout = workoutToDelete ?? operatingWorkout;

    if (workout.id === 0) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const success = await DeleteWorkoutWithId(workout.id);

      if (!success) return;

      const isTemplate = false;

      const workoutMultisetIds = await GetUniqueMultisetIds(
        workout.id,
        isTemplate
      );

      // Delete all multisets in workout
      for (const multisetId of workoutMultisetIds) {
        await DeleteMultisetWithId(multisetId);
      }

      // Delete all sets referencing workout
      db.execute("DELETE from sets WHERE workout_id = $1", [workout.id]);

      const updatedWorkouts = removeWorkoutFromList(workout.id);

      setWorkouts(updatedWorkouts);

      toast.success("Workout Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingWorkout();
    deleteModal.onClose();
  };

  const removeWorkoutFromList = (workoutId: number) => {
    let updatedWorkoutsHasEmptyWorkouts = false;

    const updatedWorkouts: Workout[] = [];

    for (const workout of workouts) {
      if (workout.id !== workoutId) {
        updatedWorkouts.push(workout);

        if (workout.numSets === 0) updatedWorkoutsHasEmptyWorkouts = true;
      }
    }

    workoutListHasEmptyWorkouts.current = updatedWorkoutsHasEmptyWorkouts;

    return updatedWorkouts;
  };

  const resetOperatingWorkout = () => {
    setOperatingWorkout(DEFAULT_WORKOUT);
    setOperationType("edit");
  };

  const handleWorkoutOptionSelection = (key: string, workout: Workout) => {
    if (userSettings === undefined) return;

    switch (key) {
      case "edit": {
        editWorkout(workout);
        break;
      }
      case "delete": {
        if (workout.numSets === 0 || !!userSettings.never_show_delete_modal) {
          deleteWorkout(workout);
        } else {
          setOperationType("delete");
          setOperatingWorkout(workout);
          deleteModal.onOpen();
        }
        break;
      }
      case "reassign-workout-template": {
        setOperationType("reassign-workout-template");
        setOperatingWorkout(workout);
        handleOpenWorkoutTemplateListModal(userSettings);
        break;
      }
      case "reassign-routine": {
        setOperationType("reassign-routine");
        setOperatingWorkout(workout);
        routineList.handleOpenRoutineListModal(userSettings);
        break;
      }
    }
  };

  const editWorkout = (workout: Workout) => {
    setOperationType("edit");
    setOperatingWorkout(workout);
    workoutModal.onOpen();
  };

  const updateWorkout = async (updatedWorkout: Workout) => {
    if (updatedWorkout.id === 0 || operationType !== "edit") return;

    const success = await UpdateWorkout(updatedWorkout);

    if (!success) return;

    const updatedWorkouts = UpdateItemInList(workouts, updatedWorkout);

    sortWorkoutsByActiveCategory(updatedWorkouts);

    resetOperatingWorkout();
    toast.success("Workout Details Updated");
    workoutModal.onClose();
  };

  const handleOptionMenuSelection = (key: string) => {
    if (key === "delete-empty-workouts") {
      setOperationType("delete-empty-workouts");
      deleteModal.onOpen();
    }
  };

  const deleteAllEmptyWorkouts = async () => {
    if (operationType !== "delete-empty-workouts") return;

    const updatedWorkouts: Workout[] = [];

    for (let i = 0; i < workouts.length; i++) {
      if (workouts[i].numSets === 0) {
        await DeleteWorkoutWithId(workouts[i].id);
      } else {
        updatedWorkouts.push(workouts[i]);
      }
    }

    if (workouts.length !== updatedWorkouts.length) {
      sortWorkoutsByActiveCategory(updatedWorkouts);
      toast.success("Empty Workouts Deleted");
    } else {
      toast.error("No Empty Workouts In List");
    }

    workoutListHasEmptyWorkouts.current = false;
    resetOperatingWorkout();
    deleteModal.onClose();
  };

  const handleDeleteButton = async () => {
    if (operationType === "delete") {
      await deleteWorkout();
    } else if (operationType === "delete-empty-workouts") {
      await deleteAllEmptyWorkouts();
    }
  };

  const reassignWorkoutTemplate = async (workoutTemplate: WorkoutTemplate) => {
    if (
      operatingWorkout.id === 0 ||
      operationType !== "reassign-workout-template"
    )
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);
      // Reassign ALL workouts with old workout_template_id to new workout_template_id
      db.execute(
        "UPDATE workouts SET workout_template_id = $1 WHERE workout_template_id = $2",
        [workoutTemplate.id, operatingWorkout.workout_template_id]
      );

      const updatedWorkouts = workouts.map((item) =>
        item.workout_template_id === operatingWorkout.workout_template_id
          ? {
              ...item,
              workout_template_id: workoutTemplate.id,
              workoutTemplate: workoutTemplate,
              hasInvalidWorkoutTemplate: false,
            }
          : item
      );

      sortWorkoutsByActiveCategory(updatedWorkouts);

      toast.success("Workout Template Reassigned");
    } catch (error) {
      console.log(error);
    }

    if (workoutModal.isOpen) {
      // If reassigning from Edit Workout Modal
      changeWorkoutTemplate(workoutTemplate);
      setOperationType("edit");
    } else {
      resetOperatingWorkout();
    }

    workoutTemplateListModal.onClose();
  };

  const changeWorkoutTemplate = (workoutTemplate: WorkoutTemplate) => {
    if (operatingWorkout.id === 0) return;

    const updatedOperatingWorkout: Workout = {
      ...operatingWorkout,
      workout_template_id: workoutTemplate.id,
      workoutTemplate: workoutTemplate,
      hasInvalidWorkoutTemplate: false,
    };

    setOperatingWorkout(updatedOperatingWorkout);

    workoutTemplateListModal.onClose();
  };

  const removeWorkoutTemplate = () => {
    if (operatingWorkout.id === 0) return;

    const updatedOperatingWorkout: Workout = {
      ...operatingWorkout,
      workout_template_id: 0,
      workoutTemplate: undefined,
      hasInvalidWorkoutTemplate: false,
    };

    setOperatingWorkout(updatedOperatingWorkout);
  };

  const handleReassignWorkoutTemplateButton = () => {
    if (userSettings === undefined) return;

    setOperationType("reassign-workout-template");
    handleOpenWorkoutTemplateListModal(userSettings);
  };

  const reassignRoutine = async (routine: Routine) => {
    if (operatingWorkout.id === 0 || !operatingWorkout.hasInvalidRoutine)
      return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);
      // Reassign ALL workouts with old routine_id to new routine_id
      db.execute("UPDATE workouts SET routine_id = $1 WHERE routine_id = $2", [
        routine.id,
        operatingWorkout.routine_id,
      ]);

      const updatedWorkouts = workouts.map((item) =>
        item.routine_id === operatingWorkout.routine_id
          ? {
              ...item,
              routine_id: routine.id,
              routine: routine,
              hasInvalidRoutine: false,
            }
          : item
      );

      sortWorkoutsByActiveCategory(updatedWorkouts);

      toast.success("Routine Reassigned");
    } catch (error) {
      console.log(error);
    }

    if (workoutModal.isOpen) {
      // If reassigning from Edit Workout Modal
      changeRoutine(routine);
      setOperationType("edit");
    } else {
      resetOperatingWorkout();
    }

    routineList.routineListModal.onClose();
  };

  const changeRoutine = (routine: Routine) => {
    if (operatingWorkout.id === 0) return;

    const updatedOperatingWorkout: Workout = {
      ...operatingWorkout,
      routine_id: routine.id,
      routine: routine,
      hasInvalidRoutine: false,
    };

    setOperatingWorkout(updatedOperatingWorkout);

    routineList.routineListModal.onClose();
  };

  const removeRoutine = () => {
    if (operatingWorkout.id === 0) return;

    const updatedOperatingWorkout: Workout = {
      ...operatingWorkout,
      routine_id: 0,
      routine: undefined,
      hasInvalidRoutine: false,
    };

    setOperatingWorkout(updatedOperatingWorkout);
  };

  const handleReassignRoutineButton = () => {
    if (userSettings === undefined) return;

    setOperationType("reassign-routine");
    routineList.handleOpenRoutineListModal(userSettings);
  };

  if (userSettings === undefined || !isWorkoutListLoaded.current)
    return <LoadingSpinner />;

  return (
    <>
      <DeleteModal
        deleteModal={deleteModal}
        header={
          operationType === "delete-empty-workouts"
            ? "Delete All Empty Workouts"
            : "Delete Workout"
        }
        body={
          operationType === "delete-empty-workouts" ? (
            <p>
              Are you sure you want to delete{" "}
              <span className="text-secondary">all empty</span> Workouts?
            </p>
          ) : (
            <p>
              Are you sure you want to permanently delete Workout on{" "}
              <span className="text-secondary">
                {operatingWorkout.formattedDate}
              </span>
              , <strong className="font-semibold">including all sets</strong>{" "}
              performed in the Workout?
            </p>
          )
        }
        deleteButtonAction={handleDeleteButton}
      />
      <WorkoutModal
        workoutModal={workoutModal}
        workout={operatingWorkout}
        workoutTemplateNote={null}
        buttonAction={updateWorkout}
        header={operatingWorkout.formattedDate}
        handleChangeWorkoutTemplateButton={() =>
          handleOpenWorkoutTemplateListModal(userSettings)
        }
        handleRemoveWorkoutTemplateButton={removeWorkoutTemplate}
        handleReassignWorkoutTemplateButton={
          handleReassignWorkoutTemplateButton
        }
        handleChangeRoutineButton={routineList.handleOpenRoutineListModal}
        handleRemoveRoutineButton={removeRoutine}
        handleReassignRoutineButton={handleReassignRoutineButton}
        userSettings={userSettings}
      />
      <WorkoutTemplateListModal
        useWorkoutTemplateList={workoutTemplateList}
        userSettings={userSettings}
        onClickAction={
          operationType === "reassign-workout-template"
            ? reassignWorkoutTemplate
            : changeWorkoutTemplate
        }
        header={
          <span>
            {operationType === "reassign-workout-template"
              ? "Reassign Workout Template"
              : "Change Workout Template"}
          </span>
        }
      />
      <RoutineListModal
        useRoutineList={routineList}
        activeRoutineId={userSettings.active_routine_id}
        userSettings={userSettings}
        onClickAction={
          operationType === "reassign-routine" ? reassignRoutine : changeRoutine
        }
      />
      <FilterWorkoutListModal
        useWorkoutList={workoutList}
        useExerciseList={exerciseList}
        useWorkoutTemplateList={workoutTemplateList}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
      <FilterExerciseGroupsModal useExerciseList={exerciseList} />
      <FilterWorkoutTemplateListModal
        useWorkoutTemplateList={workoutTemplateList}
        useExerciseList={exerciseList}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
      <FilterRoutineListModal
        useRoutineList={routineList}
        useWorkoutTemplateList={workoutTemplateList}
        userSettings={userSettings}
      />
      <div className="flex flex-col items-center gap-1 pb-1.5">
        <ListPageSearchInput
          header="Workout List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredWorkouts.length}
          totalListLength={workouts.length}
          isListFiltered={filterMap.size > 0}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  size="sm"
                  variant="flat"
                  color="secondary"
                  onPress={() => navigate("/workouts")}
                  endContent={<GoToArrowIcon />}
                >
                  New Workout
                </Button>
                <WorkoutListOptions
                  useWorkoutList={workoutList}
                  selectedWorkoutProperties={selectedWorkoutProperties}
                  setSelectedWorkoutProperties={setSelectedWorkoutProperties}
                  userSettings={userSettings}
                  setUserSettings={setUserSettings}
                  handleOptionMenuSelection={handleOptionMenuSelection}
                />
              </div>
              {listFilters.filterMap.size > 0 && (
                <ListFilters
                  filterMap={listFilters.filterMap}
                  removeFilter={listFilters.removeFilter}
                  prefixMap={listFilters.prefixMap}
                />
              )}
            </div>
          }
        />
        <div className="flex flex-col gap-1 w-full">
          {filteredWorkouts.map((workout) => (
            <WorkoutListItem
              key={workout.id}
              workout={workout}
              selectedWorkoutProperties={selectedWorkoutProperties}
              onClickAction={() => navigate(`/workouts/${workout.id}`)}
              editWorkout={editWorkout}
              handleWorkoutOptionSelection={handleWorkoutOptionSelection}
            />
          ))}
          {workouts.length === 0 && <EmptyListLabel itemName="Workouts" />}
        </div>
      </div>
    </>
  );
}

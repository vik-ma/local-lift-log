import { useState, useEffect } from "react";
import { UserSettings, Workout, WorkoutTemplate } from "../typings";
import { useNavigate } from "react-router-dom";
import {
  LoadingSpinner,
  DeleteModal,
  WorkoutModal,
  EmptyListLabel,
  ListPageSearchInput,
  WorkoutTemplateListModal,
  WorkoutPropertyDropdown,
} from "../components";
import Database from "tauri-plugin-sql-api";
import {
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import {
  CreateWorkoutPropertySet,
  DeleteItemFromList,
  DeleteMultisetWithId,
  DeleteWorkoutWithId,
  FormatNumItemsString,
  GetUniqueMultisetIds,
  GetUserSettings,
  UpdateItemInList,
  UpdateWorkout,
} from "../helpers";
import { VerticalMenuIcon } from "../assets";
import {
  useDefaultWorkout,
  useWorkoutList,
  useWorkoutTemplateList,
} from "../hooks";

type OperationType =
  | "edit"
  | "delete"
  | "delete-empty-workouts"
  | "reassign-workout-template";

export default function WorkoutList() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] = useState<OperationType>("edit");
  const [newWorkoutNote, setNewWorkoutNote] = useState<string>("");
  const [selectedWorkoutProperties, setSelectedWorkoutProperties] = useState<
    Set<string>
  >(new Set());

  const defaultWorkout = useDefaultWorkout();

  const [operatingWorkout, setOperatingWorkout] =
    useState<Workout>(defaultWorkout);

  const navigate = useNavigate();

  const deleteModal = useDisclosure();
  const workoutModal = useDisclosure();

  const {
    workouts,
    setWorkouts,
    filterQuery,
    setFilterQuery,
    filteredWorkouts,
    sortCategory,
    handleSortOptionSelection,
  } = useWorkoutList(true);

  const workoutTemplateList = useWorkoutTemplateList(false, true);

  useEffect(() => {
    const getUserSettings = async () => {
      const settings = await GetUserSettings();

      if (settings !== undefined) {
        setUserSettings(settings);
        const workoutPropertySet = CreateWorkoutPropertySet(
          settings.shown_workout_properties
        );
        setSelectedWorkoutProperties(workoutPropertySet);
        setIsLoading(false);
      }
    };

    getUserSettings();
  }, []);

  const deleteWorkout = async () => {
    if (operatingWorkout.id === 0 || operationType !== "delete") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const success = await DeleteWorkoutWithId(operatingWorkout.id);

      if (!success) return;

      const workoutMultisetIds = await GetUniqueMultisetIds(
        operatingWorkout.id,
        false
      );

      // Delete all multisets in workout
      for (const multisetId of workoutMultisetIds) {
        await DeleteMultisetWithId(multisetId);
      }

      // Delete all sets referencing workout
      db.execute("DELETE from sets WHERE workout_id = $1", [
        operatingWorkout.id,
      ]);

      const updatedWorkouts = DeleteItemFromList(workouts, operatingWorkout.id);

      setWorkouts(updatedWorkouts);

      toast.success("Workout Deleted");
    } catch (error) {
      console.log(error);
    }

    resetOperatingWorkout();
    deleteModal.onClose();
  };

  const resetOperatingWorkout = () => {
    setOperatingWorkout(defaultWorkout);
    setOperationType("edit");
    setNewWorkoutNote("");
  };

  const handleWorkoutOptionSelection = (key: string, workout: Workout) => {
    if (key === "edit") {
      setOperationType("edit");
      setOperatingWorkout(workout);
      setNewWorkoutNote(workout.note ?? "");
      workoutModal.onOpen();
    } else if (key === "delete") {
      setOperationType("delete");
      setOperatingWorkout(workout);
      deleteModal.onOpen();
    } else if (key === "reassign-workout-template") {
      setOperationType("reassign-workout-template");
      setOperatingWorkout(workout);
      workoutTemplateList.handleOpenWorkoutTemplatesModal();
    }
  };

  const updateWorkout = async (updatedWorkout: Workout) => {
    if (updatedWorkout.id === 0 || operationType !== "edit") return;

    const success = await UpdateWorkout(updatedWorkout);

    if (!success) return;

    const updatedWorkouts = UpdateItemInList(workouts, updatedWorkout);

    setWorkouts(updatedWorkouts);

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
      setWorkouts(updatedWorkouts);
      toast.success("Empty Workouts Deleted");
    } else {
      toast.error("No Empty Workouts In List");
    }

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
              hasInvalidWorkoutTemplate: false,
            }
          : item
      );

      setWorkouts(updatedWorkouts);

      toast.success("Workout Template Reassigned");
    } catch (error) {
      console.log(error);
    }

    resetOperatingWorkout();
    workoutTemplateList.workoutTemplatesModal.onClose();
  };

  const changeWorkoutTemplate = async (workoutTemplate: WorkoutTemplate) => {
    if (operatingWorkout.id === 0) return;

    const updatedOperatingWorkout: Workout = {
      ...operatingWorkout,
      workout_template_id: workoutTemplate.id,
      workoutTemplateName: workoutTemplate.name,
    };

    setOperatingWorkout(updatedOperatingWorkout);

    workoutTemplateList.workoutTemplatesModal.onClose();
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
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
              Are you sure you want to permanently delete{" "}
              <strong className="text-secondary">all empty</strong> Workouts?
            </p>
          ) : (
            <p className="break-words">
              Are you sure you want to permanently delete Workout on{" "}
              <span className="text-secondary">
                {operatingWorkout.formattedDate}
              </span>
              , <strong>including all Sets</strong> performed in the Workout?
            </p>
          )
        }
        deleteButtonAction={handleDeleteButton}
      />
      <WorkoutModal
        workoutModal={workoutModal}
        workout={operatingWorkout}
        workoutNote={newWorkoutNote}
        setWorkoutNote={setNewWorkoutNote}
        workoutTemplateNote={null}
        buttonAction={updateWorkout}
        header={operatingWorkout.formattedDate}
        handleChangeWorkoutTemplateButton={
          workoutTemplateList.handleOpenWorkoutTemplatesModal
        }
      />
      <WorkoutTemplateListModal
        workoutTemplateList={workoutTemplateList}
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
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="Workout List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredWorkouts.length}
          totalListLength={workouts.length}
          bottomContent={
            <div className="flex justify-between">
              <Button
                size="sm"
                variant="flat"
                color="secondary"
                onPress={() => navigate("/workouts")}
              >
                New Workout
              </Button>
              <div className="flex gap-1 pr-0.5">
                <WorkoutPropertyDropdown
                  selectedWorkoutProperties={selectedWorkoutProperties}
                  setSelectedWorkoutProperties={setSelectedWorkoutProperties}
                  userSettings={userSettings}
                  setUserSettings={setUserSettings}
                />
                <Dropdown>
                  <DropdownTrigger>
                    <Button className="z-1" variant="flat" size="sm">
                      Sort By
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Sort Workouts Dropdown Menu"
                    selectionMode="single"
                    selectedKeys={[sortCategory]}
                    onAction={(key) => handleSortOptionSelection(key as string)}
                  >
                    <DropdownItem key="date-desc">
                      Date (Newest First)
                    </DropdownItem>
                    <DropdownItem key="date-asc">
                      Date (Oldest First)
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      aria-label="Toggle Workout List Options Menu"
                      isIconOnly
                      className="z-1"
                      size="sm"
                      variant="light"
                    >
                      <VerticalMenuIcon size={19} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Workout List Option Menu"
                    onAction={(key) => handleOptionMenuSelection(key as string)}
                  >
                    <DropdownItem
                      className="text-danger"
                      key="delete-empty-workouts"
                    >
                      Delete All Empty Workouts
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          }
        />
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col gap-1 w-full">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="flex justify-between items-center cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                onClick={() => navigate(`/workouts/${workout.id}`)}
              >
                <div className="flex flex-col pl-2 py-1">
                  <span className="w-[21.5rem] truncate">
                    {workout.formattedDate}
                  </span>
                  {workout.workoutTemplateName !== null &&
                    selectedWorkoutProperties.has("template") && (
                      <span className="w-[21.5rem] truncate text-sm text-indigo-500">
                        {workout.workoutTemplateName}
                      </span>
                    )}
                  {workout.hasInvalidWorkoutTemplate &&
                    selectedWorkoutProperties.has("template") && (
                      <span className="w-[21.5rem] truncate text-sm text-red-700">
                        Unknown Workout Template
                      </span>
                    )}
                  {workout.numSets! > 0 ? (
                    <span className="text-xs text-secondary">
                      {FormatNumItemsString(workout.numExercises, "Exercise")},{" "}
                      {FormatNumItemsString(workout.numSets, "Set")}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400">Empty</span>
                  )}
                  {selectedWorkoutProperties.has("note") && (
                    <span className="w-[21rem] break-all text-xs text-stone-500 text-left">
                      {workout.note}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 pr-1">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        aria-label={`Toggle Workout On ${workout.formattedDate} Options Menu`}
                        isIconOnly
                        className="z-1"
                        radius="lg"
                        variant="light"
                      >
                        <VerticalMenuIcon size={19} color="#888" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label={`Option Menu For Workout On ${workout.formattedDate}`}
                      onAction={(key) =>
                        handleWorkoutOptionSelection(key as string, workout)
                      }
                    >
                      <DropdownItem
                        className={
                          workout.hasInvalidWorkoutTemplate ? "" : "hidden"
                        }
                        key="reassign-workout-template"
                      >
                        Reassign Workout Template
                      </DropdownItem>
                      <DropdownItem key="edit">Edit</DropdownItem>
                      <DropdownItem key="delete" className="text-danger">
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            ))}
            {workouts.length === 0 && <EmptyListLabel itemName="Workouts" />}
          </div>
        )}
      </div>
    </>
  );
}

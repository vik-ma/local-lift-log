import { useState, useEffect } from "react";
import { UserSettingsOptional, Workout } from "../typings";
import { useNavigate } from "react-router-dom";
import {
  LoadingSpinner,
  DeleteModal,
  WorkoutModal,
  EmptyListLabel,
  ListPageSearchInput,
  WorkoutTemplateListModal,
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
  DeleteItemFromList,
  DeleteMultisetWithId,
  DeleteWorkoutWithId,
  FormatNumItemsString,
  GetShowWorkoutRating,
  GetUniqueMultisetIds,
  UpdateItemInList,
  UpdateShowWorkoutRating,
  UpdateWorkout,
} from "../helpers";
import { VerticalMenuIcon } from "../assets";
import {
  useDefaultWorkout,
  useWorkoutList,
  useWorkoutRatingMap,
  useWorkoutTemplateList,
} from "../hooks";

type OperationType =
  | "edit"
  | "delete"
  | "delete-empty-workouts"
  | "reassign-workout-template";

export default function WorkoutList() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();
  const [operationType, setOperationType] = useState<OperationType>("edit");
  const [newWorkoutNote, setNewWorkoutNote] = useState<string>("");

  const defaultWorkout = useDefaultWorkout();

  const [operatingWorkout, setOperatingWorkout] =
    useState<Workout>(defaultWorkout);

  const navigate = useNavigate();

  const deleteModal = useDisclosure();
  const workoutModal = useDisclosure();

  const { workoutRatingMap } = useWorkoutRatingMap();

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
      const settings = await GetShowWorkoutRating();

      setUserSettings(settings);
      setIsLoading(false);
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

  const toggleWorkoutRating = async () => {
    if (userSettings === undefined) return;

    const newValue = userSettings.show_workout_rating === 1 ? 0 : 1;

    const updatedUserSettings: UserSettingsOptional = {
      ...userSettings,
      show_workout_rating: newValue,
    };

    const success = await UpdateShowWorkoutRating(updatedUserSettings);

    if (!success) return;

    setUserSettings(updatedUserSettings);
  };

  const handleOptionMenuSelection = (key: string) => {
    if (key === "toggle-rating") {
      toggleWorkoutRating();
    } else if (key === "delete-empty-workouts") {
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
        setWorkout={setOperatingWorkout}
        workoutNote={newWorkoutNote}
        setWorkoutNote={setNewWorkoutNote}
        workoutTemplateNote={null}
        buttonAction={updateWorkout}
        header={operatingWorkout.formattedDate}
      />
      <WorkoutTemplateListModal
        workoutTemplateList={workoutTemplateList}
        onClickAction={() => {}}
        header={<span>Reassign Workout Template</span>}
      />
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="Workout List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredWorkouts.length}
          totalListLength={workouts.length}
          bottomContent={
            <div>
              {workouts.length > 0 && (
                <div className="flex justify-between">
                  <div>
                    <Button
                      size="sm"
                      variant="flat"
                      color="secondary"
                      onPress={() => navigate("/workouts")}
                    >
                      New Workout
                    </Button>
                  </div>
                  <div className="flex gap-1 pr-0.5">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button className="z-1" variant="flat" size="sm">
                          Sort By
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        selectionMode="single"
                        selectedKeys={[sortCategory]}
                        onAction={(key) =>
                          handleSortOptionSelection(key as string)
                        }
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
                          aria-label={`Toggle Workout List Options Menu`}
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
                        onAction={(key) =>
                          handleOptionMenuSelection(key as string)
                        }
                      >
                        <DropdownItem key="toggle-rating">
                          {userSettings.show_workout_rating === 1
                            ? "Hide Workout Rating"
                            : "Show Workout Rating"}
                        </DropdownItem>
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
              )}
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
                  <span className="w-[10.5rem] truncate">
                    {workout.formattedDate}
                  </span>
                  {workout.workoutTemplateName !== null && (
                    <span className="w-[16rem] truncate text-sm text-indigo-500">
                      {workout.workoutTemplateName}
                    </span>
                  )}
                  {workout.hasInvalidWorkoutTemplate && (
                    <span className="w-[16rem] truncate text-sm text-red-700">
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
                  <span
                    className={
                      userSettings.show_workout_rating === 1
                        ? "w-[16rem] break-all text-xs text-stone-500 text-left"
                        : "w-[21rem] break-all text-xs text-stone-500 text-left"
                    }
                  >
                    {workout.note}
                  </span>
                </div>
                <div className="flex items-center gap-1 pr-1">
                  {userSettings.show_workout_rating === 1 && (
                    <div className="flex flex-col w-[4.5rem] text-center text-sm text-stone-500">
                      <span>Rating</span>
                      <span className="font-semibold">
                        {workoutRatingMap[workout.rating].span}
                      </span>
                    </div>
                  )}
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

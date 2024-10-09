import { useState, useEffect } from "react";
import { UserSettingsOptional, Workout } from "../typings";
import { useNavigate } from "react-router-dom";
import {
  LoadingSpinner,
  DeleteModal,
  WorkoutModal,
  EmptyListLabel,
  ListPageSearchInput,
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
} from "../hooks";

type OperationType = "edit" | "delete";

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
    showNewestFirst,
    reverseWorkoutList,
    filterQuery,
    setFilterQuery,
    filteredWorkouts,
  } = useWorkoutList(true);

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

      db.execute("DELETE from workouts WHERE id = $1", [operatingWorkout.id]);

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

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <DeleteModal
        deleteModal={deleteModal}
        header="Delete Workout"
        body={
          <p className="break-words">
            Are you sure you want to permanently delete Workout on{" "}
            <span className="text-secondary">
              {operatingWorkout.formattedDate}
            </span>
            , <strong>including all Sets</strong> performed in the Workout?
          </p>
        }
        deleteButtonAction={deleteWorkout}
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
                  <Button
                    className="w-36"
                    size="sm"
                    onPress={() => toggleWorkoutRating()}
                  >
                    {userSettings.show_workout_rating === 1
                      ? "Hide Workout Rating"
                      : "Show Workout Rating"}
                  </Button>
                  <Button
                    className="w-32"
                    size="sm"
                    onPress={() => reverseWorkoutList()}
                  >
                    {showNewestFirst
                      ? "List Oldest First"
                      : "List Latest First"}
                  </Button>
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
                <div className="flex flex-col justify-start items-start pl-2 py-1">
                  <span className="w-[10.5rem] truncate text-left">
                    {workout.formattedDate}
                  </span>
                  {workout.numSets! > 0 ? (
                    <span className="text-xs text-secondary text-left">
                      {FormatNumItemsString(workout.numExercises, "Exercise")},{" "}
                      {FormatNumItemsString(workout.numSets, "Set")}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400 text-left">
                      Empty
                    </span>
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

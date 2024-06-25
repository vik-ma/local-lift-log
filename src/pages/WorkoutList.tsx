import { useState, useEffect } from "react";
import { UserSettingsOptional, Workout } from "../typings";
import { useNavigate } from "react-router-dom";
import {
  LoadingSpinner,
  DeleteModal,
  WorkoutModal,
  WorkoutRatingSpan,
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
  FormatYmdDateString,
  GetShowWorkoutRating,
  UpdateShowWorkoutRating,
  UpdateWorkout,
} from "../helpers";
import { VerticalMenuIcon } from "../assets";
import { useDefaultWorkout } from "../hooks";

type OperationType = "edit" | "delete";

export default function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
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

  useEffect(() => {
    const getWorkouts = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        // Get id, date, rating and how many Sets and Exercises every Workout contains
        const result = await db.select<Workout[]>(
          `SELECT workouts.*, 
          COUNT(DISTINCT CASE WHEN is_template = 0 THEN sets.exercise_id END) AS numExercises,
          SUM(CASE WHEN is_template = 0 THEN 1 ELSE 0 END) AS numSets
          FROM workouts LEFT JOIN sets 
          ON workouts.id = sets.workout_id 
          GROUP BY workouts.id`
        );

        const workouts: Workout[] = result.map((row) => {
          const formattedDate: string = FormatYmdDateString(row.date);
          return {
            id: row.id,
            workout_template_id: row.workout_template_id,
            date: formattedDate,
            exercise_order: row.exercise_order,
            note: row.note,
            is_loaded: row.is_loaded,
            rating: row.rating,
            numSets: row.numSets,
            numExercises: row.numExercises,
          };
        });

        setWorkouts(workouts);
      } catch (error) {
        console.log(error);
      }
    };

    const getUserSettings = async () => {
      const settings = await GetShowWorkoutRating();

      setUserSettings(settings);
      setIsLoading(false);
    };

    getWorkouts();
    getUserSettings();
  }, []);

  const deleteWorkout = async () => {
    if (operatingWorkout.id === 0 || operationType !== "delete") return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from workouts WHERE id = $1", [operatingWorkout.id]);

      // Delete all sets referencing workout
      db.execute("DELETE from sets WHERE workout_id = $1", [
        operatingWorkout.id,
      ]);

      const updatedWorkouts: Workout[] = workouts.filter(
        (item) => item.id !== operatingWorkout?.id
      );
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

    const updatedWorkouts: Workout[] = workouts.map((item) =>
      item.id === operatingWorkout.id ? updatedWorkout : item
    );

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
            {operatingWorkout?.date}, including all Sets performed in the
            Workout?
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
        header={operatingWorkout.date}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Workout List
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {workouts.length > 0 && (
              <div className="flex justify-center">
                <Button
                  className="w-36"
                  size="sm"
                  onPress={() => toggleWorkoutRating()}
                >
                  {userSettings.show_workout_rating === 1
                    ? "Hide Workout Rating"
                    : "Show Workout Rating"}
                </Button>
              </div>
            )}
            <div className="flex flex-col gap-1 w-full">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                  onClick={() => navigate(`/workouts/${workout.id}`)}
                >
                  <div className="flex gap-1 justify-between items-center w-full">
                    <div className="flex flex-col justify-start items-start">
                      <span className="w-[10.5rem] truncate text-left">
                        {workout.date}
                      </span>
                      {workout.numSets! > 0 ? (
                        <span className="text-xs text-yellow-600 text-left">
                          {workout.numExercises} Exercises, {workout.numSets}{" "}
                          Sets
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400 text-left">
                          Empty
                        </span>
                      )}
                      <span
                        className={
                          userSettings.show_workout_rating === 1
                            ? "w-[16.5rem] break-all text-xs text-stone-500 text-left"
                            : "w-[21.5rem] break-all text-xs text-stone-500 text-left"
                        }
                      >
                        {workout.note}
                      </span>
                    </div>
                    {userSettings.show_workout_rating === 1 && (
                      <div className="flex flex-col w-[4.5rem] text-center text-sm text-stone-500">
                        <span>Rating</span>
                        <span className="font-semibold">
                          <WorkoutRatingSpan rating={workout.rating} />
                        </span>
                      </div>
                    )}
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          aria-label={`Toggle Workout On ${workout.date} Options Menu`}
                          isIconOnly
                          className="z-1"
                          size="sm"
                          radius="lg"
                          variant="light"
                        >
                          <VerticalMenuIcon size={17} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label={`Option Menu For Workout On ${workout.date}`}
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
            </div>
          </>
        )}
      </div>
    </>
  );
}

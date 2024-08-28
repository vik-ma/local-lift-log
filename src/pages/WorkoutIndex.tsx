import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import {
  LoadingSpinner,
  WorkoutListModal,
  WorkoutTemplateListModal,
} from "../components";
import { useWorkoutList, useWorkoutTemplateList } from "../hooks";
import { useEffect, useState } from "react";
import {
  CopyWorkoutSetList,
  GetUserSettings,
  GetWorkoutSetList,
  CreateWorkout,
  UpdateWorkout,
} from "../helpers";
import { UserSettings, Workout } from "../typings";

export default function WorkoutIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const navigate = useNavigate();

  const { workoutTemplatesModal, workoutTemplates } = useWorkoutTemplateList();

  const workoutList = useWorkoutList(false, true);

  useEffect(() => {
    const getShowWorkoutRating = async () => {
      const settings = await GetUserSettings();
      setUserSettings(settings);
    };

    getShowWorkoutRating();
  }, []);

  const handleCreateEmptyWorkout = async () => {
    const newWorkout = await CreateWorkout(0);

    if (newWorkout === undefined) return;

    navigate(`/workouts/${newWorkout}`);
  };

  const handleClickWorkout = async (
    workoutToCopy: Workout,
    keepSetValues: boolean
  ) => {
    if (userSettings === undefined) return;

    const newWorkout = await CreateWorkout(0);

    if (newWorkout === undefined) return;

    const oldWorkoutSetList = await GetWorkoutSetList(workoutToCopy.id);

    const { workoutExerciseOrder } = await CopyWorkoutSetList(
      oldWorkoutSetList,
      newWorkout.id,
      keepSetValues,
      userSettings,
      workoutToCopy.exercise_order
    );

    newWorkout.exercise_order = workoutExerciseOrder;
    newWorkout.is_loaded = 1;

    const success = await UpdateWorkout(newWorkout);

    if (!success) return;

    navigate(`/workouts/${newWorkout.id}`);
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <WorkoutTemplateListModal
        workoutTemplateListModal={workoutTemplatesModal}
        workoutTemplates={workoutTemplates}
        listboxOnActionFunction={CreateWorkout}
        header={<span>Load Workout Template</span>}
      />
      <WorkoutListModal
        workoutListModal={workoutList.workoutListModal}
        showWorkoutRating={userSettings.show_workout_rating}
        workoutList={workoutList}
        onClickAction={handleClickWorkout}
      />
      <div className="flex flex-col gap-3">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Workouts
          </h1>
        </div>
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col gap-1">
            <Button
              className="font-medium text-base"
              color="primary"
              onPress={handleCreateEmptyWorkout}
            >
              New Empty Workout
            </Button>
            <Button
              className="font-medium text-base"
              color="primary"
              onPress={() => workoutTemplatesModal.onOpen()}
            >
              New Workout From Template
            </Button>
            <Button
              className="font-medium text-base"
              color="primary"
              onPress={workoutList.handleOpenWorkoutListModal}
            >
              Copy Previous Workout
            </Button>
            <Button
              className="font-medium text-base mt-4"
              variant="flat"
              onPress={() => navigate(`/workouts/list`)}
            >
              Workout List
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

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
  CreateSetsFromWorkoutTemplate,
  GenerateExerciseOrderString,
} from "../helpers";
import { UserSettings, Workout, WorkoutTemplate } from "../typings";

export default function WorkoutIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const navigate = useNavigate();

  const workoutTemplateList = useWorkoutTemplateList(true, true);

  const workoutList = useWorkoutList(false, true);

  useEffect(() => {
    const getUserSettings = async () => {
      const settings = await GetUserSettings();
      setUserSettings(settings);
    };

    getUserSettings();
  }, []);

  const handleCreateEmptyWorkout = async () => {
    const newWorkout = await CreateWorkout(0);

    if (newWorkout === undefined) return;

    navigate(`/workouts/${newWorkout.id}`);
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

    const success = await UpdateWorkout(newWorkout);

    if (!success) return;

    navigate(`/workouts/${newWorkout.id}`);
  };

  const handleClickWorkoutTemplate = async (
    workoutTemplate: WorkoutTemplate
  ) => {
    const newWorkout = await CreateWorkout(workoutTemplate.id);

    if (newWorkout === undefined) return;

    const groupedSetList = await CreateSetsFromWorkoutTemplate(
      newWorkout.id,
      workoutTemplate.id
    );

    const exerciseOrder = GenerateExerciseOrderString(groupedSetList);
    newWorkout.exercise_order = exerciseOrder;

    const success = await UpdateWorkout(newWorkout);

    if (!success) return;

    navigate(`/workouts/${newWorkout.id}`);
  };

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <WorkoutTemplateListModal
        workoutTemplateList={workoutTemplateList}
        onClickAction={handleClickWorkoutTemplate}
        header={<span>Load Workout Template</span>}
      />
      <WorkoutListModal
        workoutListModal={workoutList.workoutListModal}
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
              onPress={() => workoutTemplateList.workoutTemplatesModal.onOpen()}
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

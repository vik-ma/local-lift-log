import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import {
  FilterExerciseGroupsModal,
  FilterRoutineListModal,
  FilterWorkoutListModal,
  FilterWorkoutTemplateListModal,
  LoadingSpinner,
  WorkoutListModal,
  WorkoutTemplateListModal,
} from "../components";
import {
  useExerciseList,
  useFilterExerciseList,
  useWorkoutList,
} from "../hooks";
import { useEffect, useRef, useState } from "react";
import {
  CopyWorkoutSetList,
  GetUserSettings,
  GetWorkoutSetList,
  CreateWorkout,
  UpdateWorkout,
  CreateSetsFromWorkoutTemplate,
  GenerateExerciseOrderString,
  LoadStore,
} from "../helpers";
import { UserSettings, Workout, WorkoutTemplate } from "../typings";
import { Store } from "@tauri-apps/plugin-store";

export default function WorkoutIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const navigate = useNavigate();

  const store = useRef<Store>(null);

  const exerciseList = useExerciseList(store);

  const { setIncludeSecondaryGroups } = exerciseList;

  const workoutList = useWorkoutList(store, exerciseList, true);

  const { workoutTemplateList, routineList, handleOpenWorkoutListModal } =
    workoutList;

  const { handleOpenWorkoutTemplateListModal } = workoutTemplateList;

  const filterExerciseList = useFilterExerciseList(exerciseList);

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      setUserSettings(userSettings);

      setIncludeSecondaryGroups(
        userSettings.show_secondary_exercise_groups === 1
      );

      await LoadStore(store);
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const newWorkout = await CreateWorkout(0);

    if (newWorkout === undefined) return;

    const oldWorkoutSetList = await GetWorkoutSetList(workoutToCopy.id);

    const { workoutExerciseOrder } = await CopyWorkoutSetList(
      oldWorkoutSetList,
      newWorkout.id,
      keepSetValues,
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
      workoutTemplate.id,
      exerciseList.exerciseGroupDictionary
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
        useWorkoutTemplateList={workoutTemplateList}
        onClickAction={handleClickWorkoutTemplate}
        header={<span>Load Workout Template</span>}
      />
      <WorkoutListModal
        workoutList={workoutList}
        shownWorkoutProperties={userSettings.shown_workout_properties}
        onClickAction={handleClickWorkout}
      />
      <FilterWorkoutListModal
        useWorkoutList={workoutList}
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
        useWorkoutTemplateList={workoutTemplateList}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
      <FilterExerciseGroupsModal
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
      />
      <FilterWorkoutTemplateListModal
        useWorkoutTemplateList={workoutTemplateList}
        useExerciseList={exerciseList}
        useFilterExerciseList={filterExerciseList}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
      <FilterRoutineListModal
        useRoutineList={routineList}
        useWorkoutTemplateList={workoutTemplateList}
        userSettings={userSettings}
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
              onPress={handleOpenWorkoutTemplateListModal}
            >
              New Workout From Template
            </Button>
            <Button
              className="font-medium text-base"
              color="primary"
              onPress={handleOpenWorkoutListModal}
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

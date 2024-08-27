import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import {
  LoadingSpinner,
  WorkoutListModal,
  WorkoutTemplateListModal,
} from "../components";
import {
  useCreateWorkout,
  useWorkoutList,
  useWorkoutTemplateList,
} from "../hooks";
import { useEffect, useState } from "react";
import { GetUserSettings } from "../helpers";
import { UserSettings } from "../typings";

export default function WorkoutIndex() {
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const navigate = useNavigate();

  const { workoutTemplatesModal, workoutTemplates } = useWorkoutTemplateList();

  const { createWorkout } = useCreateWorkout();

  const workoutList = useWorkoutList(false);

  useEffect(() => {
    const getUserSettings = async () => {
      const settings = await GetUserSettings();
      setUserSettings(settings);
    };

    getUserSettings();
  }, []);

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <WorkoutTemplateListModal
        workoutTemplateListModal={workoutTemplatesModal}
        workoutTemplates={workoutTemplates}
        listboxOnActionFunction={createWorkout}
        header={<span>Load Workout Template</span>}
      />
      <WorkoutListModal
        workoutListModal={workoutList.workoutListModal}
        showWorkoutRating={userSettings.show_workout_rating}
        workoutList={workoutList}
        onClickAction={() => {}}
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
              onPress={() => createWorkout(0)}
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

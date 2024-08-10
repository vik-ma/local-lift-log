import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

import { WorkoutTemplateListModal } from "../components";
import { useWorkoutTemplateList } from "../hooks";

export default function WorkoutIndex() {
  const navigate = useNavigate();

  const { workoutTemplatesModal, workoutTemplates, createWorkout } =
    useWorkoutTemplateList();

  return (
    <>
      <WorkoutTemplateListModal
        workoutTemplateListModal={workoutTemplatesModal}
        workoutTemplates={workoutTemplates}
        listboxOnActionFunction={createWorkout}
        header={<span>Load Workout Template</span>}
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
              color="primary"
              className="font-medium text-lg w-72"
              onPress={() => createWorkout(0)}
            >
              New Empty Workout
            </Button>
            <Button
              color="primary"
              className="font-medium text-lg w-72"
              onPress={() => workoutTemplatesModal.onOpen()}
            >
              New Workout From Template
            </Button>
          </div>
          <Button
            className="font-medium text-lg w-72"
            onPress={() => navigate(`/workouts/list`)}
          >
            Workout List
          </Button>
        </div>
      </div>
    </>
  );
}

import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

export default function WorkoutIndex() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Workouts
          </h1>
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          <Button size="lg" color="success" className="font-medium text-xl">
            New Empty Workout
          </Button>
          <Button size="lg" color="success" className="font-medium text-xl">
            New Workout From Template
          </Button>
          <Button
            size="lg"
            color="primary"
            className="font-medium text-xl"
            onPress={() => navigate(`/workouts/list`)}
          >
            Workout List
          </Button>
        </div>
      </div>
    </>
  );
}

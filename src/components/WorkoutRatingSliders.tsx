import { Slider } from "@nextui-org/react";
import { Workout } from "../typings";

type WorkoutRatingSlidersProps = {
  workout: Workout;
  setWorkout: React.Dispatch<React.SetStateAction<Workout>>;
};
export const WorkoutRatingSliders = ({
  workout,
  setWorkout,
}: WorkoutRatingSlidersProps) => {
  const handleRatingChange = (value: number, key: string) => {
    if (!Number.isInteger(value) || value < -5 || value > 5) return;

    switch (key) {
      case "general":
        setWorkout((prev) => ({
          ...prev,
          rating_general: value,
        }));
        break;
      default:
        break;
    }
  };

  const getRatingSliderColor = (value: number) => {
    if (value > 0) return "success";
    if (value < 0) return "danger";
    return "foreground";
  };

  return (
    <>
      <Slider
        step={1}
        value={workout.rating_general}
        onChange={(value) => handleRatingChange(value as number, "general")}
        label="General"
        color={getRatingSliderColor(workout.rating_general)}
        maxValue={5}
        minValue={-5}
        fillOffset={0}
        marks={[
          {
            value: -5,
            label: "0",
          },
          {
            value: 5,
            label: "10",
          },
        ]}
        getValue={(value) => `${Number(value) + 5}`}
      />
    </>
  );
};

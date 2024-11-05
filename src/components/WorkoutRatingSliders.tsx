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
      case "energy":
        setWorkout((prev) => ({
          ...prev,
          rating_energy: value,
        }));
        break;
      case "injury":
        setWorkout((prev) => ({
          ...prev,
          rating_injury: value,
        }));
        break;
      case "sleep":
        setWorkout((prev) => ({
          ...prev,
          rating_sleep: value,
        }));
        break;
      case "calories":
        setWorkout((prev) => ({
          ...prev,
          rating_calories: value,
        }));
        break;
      case "fasting":
        setWorkout((prev) => ({
          ...prev,
          rating_fasting: value,
        }));
        break;
      case "time":
        setWorkout((prev) => ({
          ...prev,
          rating_time: value,
        }));
        break;
      case "stress":
        setWorkout((prev) => ({
          ...prev,
          rating_stress: value,
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
      <Slider
        step={1}
        value={workout.rating_energy}
        onChange={(value) => handleRatingChange(value as number, "energy")}
        label="Energy"
        color={getRatingSliderColor(workout.rating_energy)}
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
      <Slider
        step={1}
        value={workout.rating_injury}
        onChange={(value) => handleRatingChange(value as number, "injury")}
        label="Injury Level"
        color={getRatingSliderColor(workout.rating_injury)}
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
      <Slider
        step={1}
        value={workout.rating_sleep}
        onChange={(value) => handleRatingChange(value as number, "sleep")}
        label="Sleep Quality"
        color={getRatingSliderColor(workout.rating_sleep)}
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
      <Slider
        step={1}
        value={workout.rating_calories}
        onChange={(value) => handleRatingChange(value as number, "calories")}
        label="Caloric Intake"
        color={getRatingSliderColor(workout.rating_calories)}
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
      <Slider
        step={1}
        value={workout.rating_fasting}
        onChange={(value) => handleRatingChange(value as number, "fasting")}
        label="Time Fasted"
        color={getRatingSliderColor(workout.rating_fasting)}
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
      <Slider
        step={1}
        value={workout.rating_time}
        onChange={(value) => handleRatingChange(value as number, "time")}
        label="Time Available"
        color={getRatingSliderColor(workout.rating_time)}
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
      <Slider
        step={1}
        value={workout.rating_stress}
        onChange={(value) => handleRatingChange(value as number, "stress")}
        label="Stress Level"
        color={getRatingSliderColor(workout.rating_stress)}
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

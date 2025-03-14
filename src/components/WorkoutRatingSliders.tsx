import { Slider } from "@heroui/react";
import { Workout } from "../typings";
import { useMemo } from "react";
import { GetWorkoutRatingOrder, WorkoutRatingsMap } from "../helpers";

type WorkoutRatingSlidersProps = {
  workout: Workout;
  setWorkout: React.Dispatch<React.SetStateAction<Workout>>;
  workoutRatingsOrder: string;
};
export const WorkoutRatingSliders = ({
  workout,
  setWorkout,
  workoutRatingsOrder,
}: WorkoutRatingSlidersProps) => {
  const ratingsOrder = useMemo(() => {
    return GetWorkoutRatingOrder(workoutRatingsOrder);
  }, [workoutRatingsOrder]);

  const workoutRatingsMap = useMemo(() => {
    return WorkoutRatingsMap();
  }, []);

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
        style={{ order: ratingsOrder[0] }}
        step={1}
        value={workout.rating_general}
        onChange={(value) => handleRatingChange(value as number, "general")}
        label={workoutRatingsMap["general"].label}
        color={getRatingSliderColor(workout.rating_general)}
        maxValue={5}
        minValue={-5}
        fillOffset={0}
        marks={[
          {
            value: -5,
            label: "Bad",
          },
          {
            value: 5,
            label: "Good",
          },
        ]}
        getValue={(value) => `${Number(value) + 5}`}
      />
      <Slider
        style={{ order: ratingsOrder[1] }}
        step={1}
        value={workout.rating_energy}
        onChange={(value) => handleRatingChange(value as number, "energy")}
        label={workoutRatingsMap["energy"].label}
        color={getRatingSliderColor(workout.rating_energy)}
        maxValue={5}
        minValue={-5}
        fillOffset={0}
        marks={[
          {
            value: -5,
            label: "Low",
          },
          {
            value: 5,
            label: "High",
          },
        ]}
        getValue={(value) => `${Number(value) + 5}`}
      />
      <Slider
        style={{ order: ratingsOrder[2] }}
        step={1}
        value={workout.rating_injury}
        onChange={(value) => handleRatingChange(value as number, "injury")}
        label={workoutRatingsMap["injury"].label}
        color={getRatingSliderColor(workout.rating_injury)}
        maxValue={5}
        minValue={-5}
        fillOffset={0}
        marks={[
          {
            value: -5,
            label: "Serious",
          },
          {
            value: 5,
            label: "None",
          },
        ]}
        getValue={(value) => `${Number(value) + 5}`}
      />
      <Slider
        style={{ order: ratingsOrder[3] }}
        step={1}
        value={workout.rating_sleep}
        onChange={(value) => handleRatingChange(value as number, "sleep")}
        label={workoutRatingsMap["sleep"].label}
        color={getRatingSliderColor(workout.rating_sleep)}
        maxValue={5}
        minValue={-5}
        fillOffset={0}
        marks={[
          {
            value: -5,
            label: "Bad",
          },
          {
            value: 5,
            label: "Good",
          },
        ]}
        getValue={(value) => `${Number(value) + 5}`}
      />
      <Slider
        style={{ order: ratingsOrder[4] }}
        step={1}
        value={workout.rating_calories}
        onChange={(value) => handleRatingChange(value as number, "calories")}
        label={workoutRatingsMap["calories"].label}
        color={getRatingSliderColor(workout.rating_calories)}
        maxValue={5}
        minValue={-5}
        fillOffset={0}
        marks={[
          {
            value: -5,
            label: "Deficit",
          },
          {
            value: 5,
            label: "Surplus",
          },
        ]}
        getValue={(value) => `${Number(value) + 5}`}
      />
      <Slider
        style={{ order: ratingsOrder[5] }}
        step={1}
        value={workout.rating_fasting}
        onChange={(value) => handleRatingChange(value as number, "fasting")}
        label={workoutRatingsMap["fasting"].label}
        color={getRatingSliderColor(workout.rating_fasting)}
        maxValue={5}
        minValue={-5}
        fillOffset={0}
        marks={[
          {
            value: -5,
            label: "Long",
          },
          {
            value: 5,
            label: "Short",
          },
        ]}
        getValue={(value) => `${Number(value) + 5}`}
      />
      <Slider
        style={{ order: ratingsOrder[6] }}
        step={1}
        value={workout.rating_time}
        onChange={(value) => handleRatingChange(value as number, "time")}
        label={workoutRatingsMap["time"].label}
        color={getRatingSliderColor(workout.rating_time)}
        maxValue={5}
        minValue={-5}
        fillOffset={0}
        marks={[
          {
            value: -5,
            label: "Short",
          },
          {
            value: 5,
            label: "Long",
          },
        ]}
        getValue={(value) => `${Number(value) + 5}`}
      />
      <Slider
        style={{ order: ratingsOrder[7] }}
        step={1}
        value={workout.rating_stress}
        onChange={(value) => handleRatingChange(value as number, "stress")}
        label={workoutRatingsMap["stress"].label}
        color={getRatingSliderColor(workout.rating_stress)}
        maxValue={5}
        minValue={-5}
        fillOffset={0}
        marks={[
          {
            value: -5,
            label: "High",
          },
          {
            value: 5,
            label: "Low",
          },
        ]}
        getValue={(value) => `${Number(value) + 5}`}
      />
    </>
  );
};

type DefaultExercise = {
  name: string;
  exercise_group_set_string_primary: string;
  exercise_group_set_string_secondary: string | null;
};

export const DefaultExercises = (): DefaultExercise[] => {
  const defaultMultiplier = 0.5;

  const DEFAULT_EXERCISES: DefaultExercise[] = [
    {
      name: "Bench Press",
      exercise_group_set_string_primary: "0",
      exercise_group_set_string_secondary: `1x${defaultMultiplier},4x${defaultMultiplier}`,
    },
    {
      name: "Hammer Curl",
      exercise_group_set_string_primary: "2,3",
      exercise_group_set_string_secondary: null,
    },
    {
      name: "Lateral Raise",
      exercise_group_set_string_primary: "4",
      exercise_group_set_string_secondary: null,
    },
    {
      name: "Deadlift",
      exercise_group_set_string_primary: "7,8",
      exercise_group_set_string_secondary: `3x${defaultMultiplier},5x${defaultMultiplier},6x${defaultMultiplier},9x${defaultMultiplier},10x${defaultMultiplier},11x${defaultMultiplier}`,
    },
    {
      name: "Calf Raise",
      exercise_group_set_string_primary: "12",
      exercise_group_set_string_secondary: null,
    },
    {
      name: "Sit-Up",
      exercise_group_set_string_primary: "13",
      exercise_group_set_string_secondary: null,
    },
    {
      name: "Crush Gripper",
      exercise_group_set_string_primary: "14",
      exercise_group_set_string_secondary: null,
    },
    {
      name: "Neck Curl",
      exercise_group_set_string_primary: "15",
      exercise_group_set_string_secondary: null,
    },
    {
      name: "Stationary Bike",
      exercise_group_set_string_primary: "16",
      exercise_group_set_string_secondary: null,
    },
    {
      name: "Other",
      exercise_group_set_string_primary: "17",
      exercise_group_set_string_secondary: null,
    },
  ];

  Object.freeze(DEFAULT_EXERCISES);

  return DEFAULT_EXERCISES;
};

type DefaultExercise = {
  name: string;
  exercise_group_set_string: string;
};

export const DefaultExerciseList = (): DefaultExercise[] => {
  const defaultExerciseList: DefaultExercise[] = [
    {
      name: "Bench Press",
      exercise_group_set_string: "0,1",
    },
    {
      name: "Hammer Curl",
      exercise_group_set_string: "2,3",
    },
    {
      name: "Lateral Raise",
      exercise_group_set_string: "4",
    },
    {
      name: "Deadlift",
      exercise_group_set_string: "5,6,7,8,9,10,11",
    },
    {
      name: "Calf Raise",
      exercise_group_set_string: "12",
    },
    {
      name: "Sit-Up",
      exercise_group_set_string: "13",
    },
    {
      name: "Crush Gripper",
      exercise_group_set_string: "14",
    },
    {
      name: "Neck Curl",
      exercise_group_set_string: "15",
    },
    {
      name: "Stationary Bike",
      exercise_group_set_string: "16",
    },
    {
      name: "Other",
      exercise_group_set_string: "17",
    },
  ];

  return defaultExerciseList;
};

type DefaultExercise = {
  name: string;
  exercise_group_set_string: string;
};

export const DefaultExerciseList = (): DefaultExercise[] => {
  const defaultExerciseList: DefaultExercise[] = [];

  defaultExerciseList.push({
    name: "Bench Press",
    exercise_group_set_string: "0,1",
  });
  defaultExerciseList.push({
    name: "Hammer Curl",
    exercise_group_set_string: "2,3",
  });
  defaultExerciseList.push({
    name: "Lateral Raise",
    exercise_group_set_string: "4",
  });
  defaultExerciseList.push({
    name: "Deadlift",
    exercise_group_set_string: "5,6,7,8,9,10,11",
  });
  defaultExerciseList.push({
    name: "Calf Raise",
    exercise_group_set_string: "12",
  });
  defaultExerciseList.push({
    name: "Sit-Up",
    exercise_group_set_string: "13",
  });
  defaultExerciseList.push({
    name: "Crush Gripper",
    exercise_group_set_string: "14",
  });
  defaultExerciseList.push({
    name: "Neck Curl",
    exercise_group_set_string: "15",
  });
  defaultExerciseList.push({
    name: "Stationary Bike",
    exercise_group_set_string: "16",
  });
  defaultExerciseList.push({
    name: "Other",
    exercise_group_set_string: "17",
  });

  return defaultExerciseList;
};

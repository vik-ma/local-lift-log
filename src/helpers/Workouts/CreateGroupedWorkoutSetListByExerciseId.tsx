import { WorkoutSet, GroupedWorkoutSet, Exercise } from "../../typings";
import { GetExerciseFromId } from "../Exercises/GetExerciseFromId";
import { IsNumberValidId } from "../Numbers/IsNumberValidId";

type GroupedWorkoutSets = {
  [exerciseId: number]: {
    exercise: Exercise;
    setList: WorkoutSet[];
    isExpanded: boolean;
  };
};

export const CreateGroupedWorkoutSetListByExerciseId = async (
  setList: WorkoutSet[],
  exercise_order: string
) => {
  const groupedWorkoutSets: GroupedWorkoutSets = {};

  const orderArray: number[] = exercise_order.split(",").map(Number);

  for (let i = 0; i < orderArray.length; i++) {
    const exerciseId: number = orderArray[i];

    if (!IsNumberValidId(exerciseId)) continue;

    const exercise = await GetExerciseFromId(exerciseId);
    groupedWorkoutSets[exerciseId] = {
      exercise: exercise,
      setList: [],
      isExpanded: true,
    };
  }

  setList.map((set) => {
    if (groupedWorkoutSets[set.exercise_id]) {
      groupedWorkoutSets[set.exercise_id].setList.push(set);
    }
  });

  // Remove any exercises that may exist in exercise_order, but have no sets in setList
  // (exerciseId keys with an empty setList)
  const groupedWorkoutSetList: GroupedWorkoutSet[] = Object.values(
    groupedWorkoutSets
  ).filter((value) => value.setList.length > 0);

  // Sort the groupedWorkoutSetList array based on the exercise_order string
  groupedWorkoutSetList.sort((a, b) => {
    const indexA = orderArray.indexOf(a.exercise.id);
    const indexB = orderArray.indexOf(b.exercise.id);
    return indexA - indexB;
  });

  return groupedWorkoutSetList;
};

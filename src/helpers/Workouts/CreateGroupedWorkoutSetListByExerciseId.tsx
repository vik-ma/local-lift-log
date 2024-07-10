import { WorkoutSet, GroupedWorkoutSet, Exercise } from "../../typings";
import { GetExerciseFromId } from "../Exercises/GetExerciseFromId";
import { ValidateExerciseOrderEntry } from "./ValidateExerciseOrderEntry";

type GroupedWorkoutSets = {
  [exerciseId: string]: {
    exerciseList: Exercise[];
    setList: WorkoutSet[];
    isExpanded: boolean;
    isMultiset: boolean;
    multiset_type?: number;
  };
};

export const CreateGroupedWorkoutSetListByExerciseId = async (
  setList: WorkoutSet[],
  exercise_order: string
) => {
  const groupedWorkoutSets: GroupedWorkoutSets = {};

  const orderArray: string[] = exercise_order.split(",");

  for (let i = 0; i < orderArray.length; i++) {
    const entry: string = orderArray[i];

    const validatedEntry = ValidateExerciseOrderEntry(entry);

    if (!validatedEntry.isValid) continue;

    const exerciseList: Exercise[] = [];

    if (!validatedEntry.isMultiset) {
      const exercise = await GetExerciseFromId(validatedEntry.id);
      exerciseList.push(exercise);
    }
    // TODO: ADD SUPPORT FOR MULTISET

    groupedWorkoutSets[entry] = {
      exerciseList: exerciseList,
      setList: [],
      isExpanded: true,
      isMultiset: validatedEntry.isMultiset,
    };
  }

  setList.map((set) => {
    if (groupedWorkoutSets[set.exercise_id.toString()]) {
      groupedWorkoutSets[set.exercise_id.toString()].setList.push(set);
    }
  });

  // Remove any exercises that may exist in exercise_order, but have no sets in setList
  // (exerciseId keys with an empty setList)
  const groupedWorkoutSetList: GroupedWorkoutSet[] = Object.values(
    groupedWorkoutSets
  ).filter((value) => value.setList.length > 0);

  // Sort the groupedWorkoutSetList array based on the exercise_order string
  groupedWorkoutSetList.sort((a, b) => {
    const indexA = orderArray.indexOf(a.exerciseList[0].id.toString());
    const indexB = orderArray.indexOf(b.exerciseList[0].id.toString());
    return indexA - indexB;
  });

  return groupedWorkoutSetList;
};

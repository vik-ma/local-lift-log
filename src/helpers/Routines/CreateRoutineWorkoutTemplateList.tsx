import { WorkoutTemplateMap } from "../../typings";

type CreateRoutineWorkoutTemplateListReturnType = {
  workoutTemplateIdList: number[];
  workoutTemplateIdSet: Set<number>;
};

export const CreateRoutineWorkoutTemplateList = (
  workoutTemplateIds: string | undefined,
  workoutTemplateMap: WorkoutTemplateMap
): CreateRoutineWorkoutTemplateListReturnType => {
  const emptyValues: CreateRoutineWorkoutTemplateListReturnType = {
    workoutTemplateIdList: [],
    workoutTemplateIdSet: new Set(),
  };

  if (workoutTemplateIds === undefined) return emptyValues;

  try {
    const idList: number[] = JSON.parse(workoutTemplateIds);

    if (idList[0] === null) return emptyValues;

    const workoutTemplateIdList: number[] = [];

    for (const id of idList) {
      if (workoutTemplateMap.has(id)) {
        workoutTemplateIdList.push(id);
      }
    }

    const workoutTemplateIdSet = new Set(workoutTemplateIdList);

    return { workoutTemplateIdList, workoutTemplateIdSet };
  } catch {
    return emptyValues;
  }
};

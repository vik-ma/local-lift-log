type CreateRoutineWorkoutTemplateListReturnType = {
  workoutTemplateIdList: number[];
  workoutTemplateIdSet: Set<number>;
};

export const CreateRoutineWorkoutTemplateList = (
  workoutTemplateIds: string | undefined
): CreateRoutineWorkoutTemplateListReturnType => {
  if (workoutTemplateIds === undefined)
    return { workoutTemplateIdList: [], workoutTemplateIdSet: new Set() };

  try {
    const workoutTemplateIdList: number[] = JSON.parse(workoutTemplateIds);

    const workoutTemplateIdSet = new Set(workoutTemplateIdList);

    return { workoutTemplateIdList, workoutTemplateIdSet };
  } catch {
    return { workoutTemplateIdList: [], workoutTemplateIdSet: new Set() };
  }
};

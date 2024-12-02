type CreateRoutineWorkoutTemplateListReturnType = {
  workoutTemplateIdList: number[];
  workoutTemplateIdSet: Set<number>;
};

export const CreateRoutineWorkoutTemplateList = (
  workoutTemplateIds: string | undefined
): CreateRoutineWorkoutTemplateListReturnType => {
  const emptyValues: CreateRoutineWorkoutTemplateListReturnType = {
    workoutTemplateIdList: [],
    workoutTemplateIdSet: new Set(),
  };

  if (workoutTemplateIds === undefined) return emptyValues;

  try {
    const workoutTemplateIdList: number[] = JSON.parse(workoutTemplateIds);

    if (workoutTemplateIdList[0] === null) return emptyValues;

    const workoutTemplateIdSet = new Set(workoutTemplateIdList);

    return { workoutTemplateIdList, workoutTemplateIdSet };
  } catch {
    return emptyValues;
  }
};

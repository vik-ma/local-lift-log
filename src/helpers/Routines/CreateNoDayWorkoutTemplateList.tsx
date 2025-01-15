import { NoDayRoutineScheduleItem, WorkoutTemplateMap } from "../../typings";

export const CreateNoDayWorkoutTemplateList = (
  workoutTemplateIds: number[],
  workoutTemplateMap: WorkoutTemplateMap
) => {
  const noDayWorkoutTemplateList: NoDayRoutineScheduleItem[] = [];

  for (let i = 0; i < workoutTemplateIds.length; i++) {
    const workoutTemplate = workoutTemplateMap.get(workoutTemplateIds[i]);

    if (workoutTemplate === undefined) continue;

    const noDayScheduleItem: NoDayRoutineScheduleItem = {
      id: i,
      workout_template_id: workoutTemplate.id,
      name: workoutTemplate.name,
    };

    noDayWorkoutTemplateList.push(noDayScheduleItem);
  }

  return noDayWorkoutTemplateList;
};

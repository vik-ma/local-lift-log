import { NoDayRoutineScheduleItem, WorkoutTemplateMap } from "../../typings";

export const CreateNoDayWorkoutTemplateList = (
  workoutTemplateIds: number[],
  workoutTemplateMap: WorkoutTemplateMap
) => {
  const noDayWorkoutTemplateList: NoDayRoutineScheduleItem[] = [];

  for (const id of workoutTemplateIds) {
    const workoutTemplate = workoutTemplateMap.get(id);

    if (workoutTemplate === undefined) continue;

    const noDayScheduleItem: NoDayRoutineScheduleItem = {
      workout_template_id: workoutTemplate.id,
      name: workoutTemplate.name,
    };

    noDayWorkoutTemplateList.push(noDayScheduleItem);
  }

  return noDayWorkoutTemplateList;
};

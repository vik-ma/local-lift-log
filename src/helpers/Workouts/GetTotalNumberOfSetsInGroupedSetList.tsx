import { GroupedWorkoutSet } from "../../typings";

export const GetTotalNumberOfSetsInGroupedSetList = (
  groupedSetList: GroupedWorkoutSet[]
) => {
  const totalSets = groupedSetList.reduce(
    (total, group) => total + group.setList.length,
    0
  );

  return totalSets;
};

import { GroupedWorkoutSet } from "../../typings";

export const MergeTwoGroupedSetLists = (
  existingGroupedSetList: GroupedWorkoutSet[],
  newGroupedSetList: GroupedWorkoutSet[]
) => {
  const updatedGroupedSetList = [...existingGroupedSetList];

  const groupedSetMap = new Map<string, GroupedWorkoutSet>();

  updatedGroupedSetList.forEach((item) => {
    groupedSetMap.set(item.id, item);
  });

  newGroupedSetList.forEach((item) => {
    if (groupedSetMap.has(item.id)) {
      // If a groupedSet with the same id exists, append the exerciseList and setList to that groupedSet
      const existingGroupedSet = groupedSetMap.get(item.id)!;
      existingGroupedSet.exerciseList.push(...item.exerciseList);
      existingGroupedSet.setList.push(...item.setList);
    } else {
      // If a groupedSet with the same id doesn't exist, add the groupedSet to existing list
      updatedGroupedSetList.push(item);
    }
  });

  return updatedGroupedSetList;
};

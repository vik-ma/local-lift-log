export const MoveItemToStartOfList = <T extends string | number>(
  list: T[],
  item: T
): T[] => {
  const updatedList = [...list];

  const index = updatedList.indexOf(item);

  if (index !== -1) {
    updatedList.splice(index, 1);
    updatedList.unshift(item);
  }

  return updatedList;
};

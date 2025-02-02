export const MoveListOfItemsToStartOfList = <T extends string | number>(
  list: T[],
  itemsToMove: T[]
) => {
  const updatedList = [...list];

  for (let i = itemsToMove.length - 1; i >= 0; i--) {
    const index = updatedList.indexOf(itemsToMove[i]);
    if (index !== -1) {
      updatedList.splice(index, 1);
      updatedList.unshift(itemsToMove[i]);
    }
  }
  return updatedList;
};

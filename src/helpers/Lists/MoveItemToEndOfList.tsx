export const MoveItemToEndOfList = <T extends string | number>(
  list: T[],
  itemToMove: T
): T[] => {
  return list
    .filter((item) => item !== itemToMove)
    .concat(list.filter((item) => item === itemToMove));
};

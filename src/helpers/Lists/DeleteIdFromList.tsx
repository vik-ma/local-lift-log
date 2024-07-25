export const DeleteIdFromList = <T extends string | number>(
  list: T[],
  idToDelete: number | string
): T[] => list.filter((id) => id !== idToDelete);

export const DoesListOrSetHaveCommonElement = <T extends number | string>(
  collectionA: Set<T> | T[] | undefined,
  setB: Set<T> | Map<T, string> | undefined
) => {
  if (collectionA === undefined || setB === undefined) return false;

  for (const item of collectionA) {
    if (setB.has(item)) return true;
  }

  return false;
};

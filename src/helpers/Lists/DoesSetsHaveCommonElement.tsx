export const DoesSetsHaveCommonElement = <T extends number | string>(
  setA: Set<T> | undefined,
  setB: Set<T> | undefined
) => {
  if (setA === undefined || setB === undefined) return false;

  for (const item of setA) {
    if (setB.has(item)) return true;
  }
  
  return false;
};

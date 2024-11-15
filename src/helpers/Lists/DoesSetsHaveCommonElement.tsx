export const DoesSetsHaveCommonElement = <T extends number | string>(
  setA: Set<T>,
  setB: Set<T>
) => {
  for (const item of setA) {
    if (setB.has(item)) return true;
  }
  return false;
};

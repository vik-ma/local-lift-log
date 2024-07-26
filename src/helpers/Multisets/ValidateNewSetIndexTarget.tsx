export const ValidateNewSetIndexTarget = (
  targetIndex: number,
  setNum: number,
  setListIndexCutoffs: Map<number, number>
): boolean => {
  // Validate that another cutoff doesn't already exist at index
  if (setListIndexCutoffs.has(targetIndex)) return false;

  const indexCutoffsArray = Array.from(setListIndexCutoffs.entries());

  let setNumIndex = 0;

  for (let i = 0; i < indexCutoffsArray.length; i++) {
    if (indexCutoffsArray[i][1] === setNum) {
      // Get index of setNum in indexCutoffsArray
      setNumIndex = i;
      break;
    }
  }

  // Get lower boundary index cutoff for setNum
  const lowerBoundary = indexCutoffsArray[setNumIndex - 1][0];

  // Get upper boundary index cutoff for setNum, if one exists
  const upperBoundary = indexCutoffsArray[setNumIndex + 1]
    ? indexCutoffsArray[setNumIndex + 1][0]
    : undefined;

  // Validate that targetIndex is between lowerBoundary and upperBoundary
  if (
    targetIndex <= lowerBoundary ||
    (upperBoundary && targetIndex >= upperBoundary)
  )
    return false;

  return true;
};

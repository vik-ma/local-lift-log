export const ValidateNewSetIndexTarget = (
  targetIndex: number,
  setNum: number,
  setListIndexCutoffs: Map<number, number>
): boolean => {
  // Validate that another cutoff doesn't already exist at index
  if (setListIndexCutoffs.has(targetIndex)) return false;

  let currentSet = 0;
  let nextSetCutoff = 0;

  let keyCounter = 0;
  let setCounter = 0;

  for (const [key, value] of setListIndexCutoffs) {
    if (key < targetIndex) {
      currentSet = value;
      setCounter++;
    }

    nextSetCutoff = key;
    keyCounter++;
  }

  // Validate that targetIndex is within bounds of setNum
  if (currentSet !== setNum) return false;

  // Validate that targetIndex does not exceed the bounds of setNum+1 (if it exists)
  if (keyCounter !== setCounter && targetIndex > nextSetCutoff) return false;

  return true;
};

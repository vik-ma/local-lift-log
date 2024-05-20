export const IsExerciseValid = (
  isNameValid: boolean,
  isGroupStringValid: boolean
): boolean => {
  if (!isNameValid) return false;
  if (!isGroupStringValid) return false;
  return true;
};

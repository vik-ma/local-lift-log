import { IsNumberValidInteger } from "..";

type ValidateExerciseOrderEntryReturnType = {
  isValid: boolean;
  isMultiset: boolean;
  id: number;
};

export const ValidateExerciseOrderEntry = (
  entry: string
): ValidateExerciseOrderEntryReturnType => {
  if (IsNumberValidInteger(Number(entry), 1)) {
    return { isValid: true, isMultiset: false, id: Number(entry) };
  }

  const regex = /^m([1-9]\d*)$/;

  if (regex.test(entry)) {
    const id = Number(entry.slice(1));
    if (IsNumberValidInteger(id, 1))
      return { isValid: true, isMultiset: true, id: id };
  }

  return { isValid: false, isMultiset: false, id: 0 };
};

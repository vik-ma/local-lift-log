import { IsNumberValidId } from "../Numbers/IsNumberValidId";

type ValidateExerciseOrderEntryReturnType = {
  isValid: boolean;
  isMultiset: boolean;
  id: number;
};

export const ValidateExerciseOrderEntry = (
  entry: string
): ValidateExerciseOrderEntryReturnType => {
  if (IsNumberValidId(Number(entry))) {
    return { isValid: true, isMultiset: false, id: Number(entry) };
  }

  const regex = /^m([1-9]\d*)$/;

  if (regex.test(entry)) {
    const id = Number(entry.slice(1));
    if (IsNumberValidId(id)) return { isValid: true, isMultiset: true, id: id };
  }

  return { isValid: false, isMultiset: false, id: 0 };
};

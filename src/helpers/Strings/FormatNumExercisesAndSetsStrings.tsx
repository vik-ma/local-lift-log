import { FormatNumItemsString } from "..";

export const FormatNumExercisesAndSetsStrings = (
  numExercises: number | undefined,
  numSets: number | undefined
) => {
  return `${FormatNumItemsString(
    numExercises,
    "Exercise"
  )}, ${FormatNumItemsString(numSets, "Set")}`;
};

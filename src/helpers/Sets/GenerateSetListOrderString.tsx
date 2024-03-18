import { WorkoutSet } from "../../typings";

export const GenerateSetListOrderString = (setList: WorkoutSet[]): string => {
  const setListOrderString = setList.map((obj) => obj.id).join(",");

  return setListOrderString;
};

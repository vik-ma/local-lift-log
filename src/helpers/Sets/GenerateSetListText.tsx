import { WorkoutSet } from "../../typings";
import { ReactNode, Fragment } from "react";

export const GenerateSetListText = (setList: WorkoutSet[]) => {
  const setListText: ReactNode = setList.map((set, index) => {
    const isLastElement = index === setList.length - 1;

    if (set.hasInvalidExerciseId) {
      return (
        <Fragment key={set.id}>
          <span className="text-red-700">Unknown</span>
          {!isLastElement && ", "}
        </Fragment>
      );
    } else {
      return (
        <Fragment key={set.id}>
          {set.exercise_name}
          {!isLastElement && ", "}
        </Fragment>
      );
    }
  });

  return setListText;
};

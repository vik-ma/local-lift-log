import { WorkoutSet } from "../../typings";
import { ReactNode, Fragment } from "react";

type GenerateSetListTextReturnType = {
  setListText: Iterable<ReactNode>;
  setListTextString: string;
};

export const GenerateSetListText = (
  setList: WorkoutSet[]
): GenerateSetListTextReturnType => {
  const setListStrings: string[] = [];

  const setListText: ReactNode = setList.map((set, index) => {
    const isLastElement = index === setList.length - 1;

    setListStrings.push(set.exercise_name ?? "");

    if (set.hasInvalidExerciseId) {
      return (
        <Fragment key={set.id}>
          <span className="text-red-700">{set.exercise_name}</span>
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

  const setListTextString = setListStrings.join(", ");

  return { setListText, setListTextString };
};

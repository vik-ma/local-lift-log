import { Fragment, ReactNode } from "react";
import { Exercise } from "../../typings";

export const GenerateMultisetExerciseListText = (exerciseList: Exercise[]) => {
  const seenExerciseIds: Set<number> = new Set();

  const exerciseListText: ReactNode = exerciseList.map((exercise, index) => {
    if (!seenExerciseIds.has(exercise.id)) {
      seenExerciseIds.add(exercise.id);

      if (exercise.isInvalid) {
        return (
          <Fragment key={exercise.id}>
            {index !== 0 && ", "}
            <span className="text-red-700">{exercise.name}</span>
          </Fragment>
        );
      } else {
        return (
          <Fragment key={exercise.id}>
            {index !== 0 && ", "}
            {exercise.name}
          </Fragment>
        );
      }
    }
  });

  return exerciseListText;
};

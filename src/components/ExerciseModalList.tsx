import { Input, ScrollShadow } from "@nextui-org/react";
import { SearchIcon } from "../assets";
import { Exercise, UseExerciseListReturnType } from "../typings";

type ExerciseModalListProps = {
  handleClickExercise: (exercise: Exercise) => void;
  exerciseList: UseExerciseListReturnType;
};

export const ExerciseModalList = ({
  handleClickExercise,
  exerciseList,
}: ExerciseModalListProps) => {
  const { filterQuery, setFilterQuery, filteredExercises } = exerciseList;

  return (
    <div className="h-[400px] flex flex-col gap-2">
      <Input
        label="Search"
        variant="faded"
        placeholder="Type to search..."
        isClearable
        value={filterQuery}
        onValueChange={setFilterQuery}
        startContent={<SearchIcon />}
      />
      <ScrollShadow className="flex flex-col gap-1">
        {filteredExercises.map((exercise) => (
          <button
            key={exercise.id}
            className="flex flex-col justify-start items-start bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:bg-default-200 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
            onClick={() => handleClickExercise(exercise)}
          >
            <span className="text-md max-w-full truncate">{exercise.name}</span>
            <span className="text-xs text-stone-500 text-left">
              {exercise.formattedGroupString}
            </span>
          </button>
        ))}
      </ScrollShadow>
    </div>
  );
};

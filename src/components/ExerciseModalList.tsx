import { Input, ScrollShadow, Button } from "@nextui-org/react";
import { SearchIcon, FavoriteIcon } from "../assets";
import { Exercise, UseExerciseListReturnType } from "../typings";
import { Link } from "react-router-dom";

type ExerciseModalListProps = {
  handleClickExercise: (exercise: Exercise) => void;
  exerciseList: UseExerciseListReturnType;
};

export const ExerciseModalList = ({
  handleClickExercise,
  exerciseList,
}: ExerciseModalListProps) => {
  const { filterQuery, setFilterQuery, filteredExercises, toggleFavorite } =
    exerciseList;

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
          <div
            key={exercise.id}
            className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
          >
            <button
              className="flex flex-col justify-start items-start pl-2 py-1"
              onClick={() => handleClickExercise(exercise)}
            >
              <span className="w-[20.5rem] truncate text-left">
                {exercise.name}
              </span>
              <span className="text-xs text-stone-500 text-left">
                {exercise.formattedGroupString}
              </span>
            </button>
            <div className="flex items-center pr-2">
              <Button
                aria-label={
                  exercise.is_favorite
                    ? `Unset Favorite For ${exercise.name}`
                    : `Set Favorite For ${exercise.name}`
                }
                isIconOnly
                className="z-1"
                size="sm"
                color={exercise.is_favorite ? "primary" : "default"}
                radius="lg"
                variant="light"
                onPress={() => toggleFavorite(exercise)}
              >
                <FavoriteIcon isChecked={!!exercise.is_favorite} size={28} />
              </Button>
            </div>
          </div>
        ))}
        {filteredExercises.length === 0 && (
          <div className="flex flex-col items-center justify-center text-stone-500 py-2">
            <h2>No Exercises Created</h2>
            <Link to={"/exercises/"}>
              Create Or Restore Default Exercises Here
            </Link>
          </div>
        )}
      </ScrollShadow>
    </div>
  );
};

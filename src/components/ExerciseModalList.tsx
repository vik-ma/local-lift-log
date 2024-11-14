import { ScrollShadow } from "@nextui-org/react";
import { Exercise, UseExerciseListReturnType } from "../typings";
import { Link } from "react-router-dom";
import { EmptyListLabel, FavoriteButton, SearchInput } from ".";

type ExerciseModalListProps = {
  handleClickExercise: (exercise: Exercise) => void;
  exerciseList: UseExerciseListReturnType;
  customHeightString?: string;
};

export const ExerciseModalList = ({
  handleClickExercise,
  exerciseList,
  customHeightString,
}: ExerciseModalListProps) => {
  const {
    filterQuery,
    setFilterQuery,
    filteredExercises,
    toggleFavorite,
    exercises,
  } = exerciseList;

  const height = customHeightString !== undefined ? customHeightString : "h-[400px]";

  return (
    <div className={`${height} flex flex-col gap-2`}>
      <SearchInput
        filterQuery={filterQuery}
        setFilterQuery={setFilterQuery}
        filteredListLength={filteredExercises.length}
        totalListLength={exercises.length}
      />
      <ScrollShadow className="flex flex-col gap-1">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="flex justify-between items-center gap-1 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
            onClick={() => handleClickExercise(exercise)}
          >
            <div className="flex flex-col justify-start items-start pl-2 py-1">
              <span className="w-[20rem] truncate text-left">
                {exercise.name}
              </span>
              <span className="text-xs text-stone-500 text-left">
                {exercise.formattedGroupStringPrimary}
              </span>
            </div>
            <div className="flex items-center pr-2">
              <FavoriteButton
                name={exercise.name}
                isFavorite={!!exercise.is_favorite}
                item={exercise}
                toggleFavorite={toggleFavorite}
              />
            </div>
          </div>
        ))}
        {filteredExercises.length === 0 && (
          <EmptyListLabel
            itemName="Exercises"
            extraContent={
              <Link to={"/exercises/"}>
                Create Or Restore Default Exercises Here
              </Link>
            }
          />
        )}
      </ScrollShadow>
    </div>
  );
};

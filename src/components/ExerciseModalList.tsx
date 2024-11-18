import { Button, ScrollShadow } from "@nextui-org/react";
import { Exercise, UseExerciseListReturnType } from "../typings";
import { Link, useNavigate } from "react-router-dom";
import {
  EmptyListLabel,
  ExerciseListOptions,
  FavoriteButton,
  SearchInput,
} from ".";
import { GoToArrowIcon } from "../assets";

type ExerciseModalListProps = {
  handleClickExercise: (exercise: Exercise) => void;
  exerciseList: UseExerciseListReturnType;
  customHeightString?: string;
  filterExercises?: Set<number>;
};

export const ExerciseModalList = ({
  handleClickExercise,
  exerciseList,
  customHeightString,
  filterExercises,
}: ExerciseModalListProps) => {
  const {
    filterQuery,
    setFilterQuery,
    filteredExercises,
    toggleFavorite,
    exercises,
    showSecondaryExerciseGroups,
  } = exerciseList;

  const height =
    customHeightString !== undefined ? customHeightString : "h-[400px]";

  const navigate = useNavigate();

  return (
    <div className={`${height} flex flex-col gap-1.5`}>
      <SearchInput
        filterQuery={filterQuery}
        setFilterQuery={setFilterQuery}
        filteredListLength={filteredExercises.length}
        totalListLength={exercises.length}
      />
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="flat"
            size="sm"
            color="secondary"
            onPress={() => navigate("/exercises")}
            endContent={<GoToArrowIcon />}
          >
            Edit Exercises
          </Button>
        </div>
        <ExerciseListOptions useExerciseList={exerciseList} />
      </div>
      <ScrollShadow className="flex flex-col gap-1">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className={
              filterExercises?.has(exercise.id)
                ? "flex justify-between items-center gap-1 cursor-pointer bg-amber-100 border-2 border-amber-300 rounded-xl hover:border-default-400 focus:border-default-400"
                : "flex justify-between items-center gap-1 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:border-default-400"
            }
            onClick={() => handleClickExercise(exercise)}
          >
            <div className="flex flex-col justify-start items-start pl-2 py-1">
              <span className="w-[20rem] truncate text-left">
                {exercise.name}
              </span>
              {!showSecondaryExerciseGroups ? (
                <span className="text-xs text-stone-400 text-left">
                  {exercise.formattedGroupStringPrimary}
                </span>
              ) : (
                <>
                  <span className="text-xs text-stone-400 text-left">
                    <span className="font-medium text-stone-600">Primary:</span>{" "}
                    {exercise.formattedGroupStringPrimary}
                  </span>
                  {exercise.formattedGroupStringSecondary !== undefined && (
                    <span className="text-xs text-stone-400 text-left">
                      <span className="font-medium text-stone-600">
                        Secondary:
                      </span>{" "}
                      {exercise.formattedGroupStringSecondary}
                    </span>
                  )}
                </>
              )}
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

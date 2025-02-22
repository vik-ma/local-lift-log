import { Button, ScrollShadow } from "@heroui/react";
import {
  Exercise,
  UseExerciseListReturnType,
  UseFilterExerciseListReturnType,
} from "../../typings";
import { Link, useNavigate } from "react-router-dom";
import {
  EmptyListLabel,
  ExerciseListOptions,
  FavoriteButton,
  ListFilters,
  SearchInput,
} from "..";
import { GoToArrowIcon } from "../../assets";
import { FormatSetsCompletedString } from "../../helpers";
import { useMemo } from "react";

type ExerciseModalListProps = {
  handleClickExercise: (exercise: Exercise) => void;
  useExerciseList: UseExerciseListReturnType;
  useFilterExerciseList: UseFilterExerciseListReturnType;
  userSettingsId: number;
  customHeightString?: string;
  selectedExercises?: Set<number>;
  isInAnalyticsPage?: boolean;
};

export const ExerciseModalList = ({
  handleClickExercise,
  useExerciseList,
  useFilterExerciseList,
  userSettingsId,
  customHeightString,
  selectedExercises,
  isInAnalyticsPage,
}: ExerciseModalListProps) => {
  const { toggleFavorite, exercises, includeSecondaryGroups } = useExerciseList;

  const {
    filterQuery,
    setFilterQuery,
    filteredExercises,
    filterMap,
    removeFilter,
    prefixMap,
  } = useFilterExerciseList;

  const height = useMemo(() => {
    return customHeightString !== undefined ? customHeightString : "h-[400px]";
  }, [customHeightString]);

  const navigate = useNavigate();

  return (
    <div className={`${height} flex flex-col gap-1.5`}>
      <div className="flex flex-col gap-1.5">
        <SearchInput
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredExercises.length}
          totalListLength={exercises.length}
          isListFiltered={filterMap.size > 0}
        />
        <div className="flex justify-between items-center">
          <Button
            variant="flat"
            size="sm"
            color="secondary"
            onPress={() => navigate("/exercises")}
            endContent={<GoToArrowIcon />}
          >
            Edit Exercises
          </Button>
          <ExerciseListOptions
            useExerciseList={useExerciseList}
            useFilterExerciseList={useFilterExerciseList}
            userSettingsId={userSettingsId}
          />
        </div>
        {filterMap.size > 0 && (
          <ListFilters
            filterMap={filterMap}
            removeFilter={removeFilter}
            prefixMap={prefixMap}
            isInModal
          />
        )}
      </div>
      <ScrollShadow className="flex flex-col gap-1">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className={
              selectedExercises?.has(exercise.id)
                ? "flex justify-between items-center gap-1 cursor-pointer bg-amber-100 border-2 border-amber-300 rounded-xl hover:border-default-400 focus:border-default-400"
                : "flex justify-between items-center gap-1 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:border-default-400"
            }
            onClick={() => handleClickExercise(exercise)}
          >
            <div className="flex flex-col justify-start items-start pl-2 py-1">
              <span className="w-[20rem] truncate text-left">
                {exercise.name}
              </span>
              {isInAnalyticsPage && (
                <span className="text-xs text-secondary text-left">
                  {FormatSetsCompletedString(exercise.set_count)}
                </span>
              )}
              {!includeSecondaryGroups ? (
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
            customLabel={
              isInAnalyticsPage ? "No Exercises Has Been Completed" : undefined
            }
            extraContent={
              isInAnalyticsPage ? undefined : (
                <Link to={"/exercises/"}>
                  Create Or Restore Default Exercises Here
                </Link>
              )
            }
          />
        )}
      </ScrollShadow>
    </div>
  );
};

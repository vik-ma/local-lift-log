import { Button, Pagination, ScrollShadow } from "@heroui/react";
import {
  Exercise,
  UseExerciseListReturnType,
  UserSettings,
} from "../../typings";
import { Link, useNavigate } from "react-router-dom";
import {
  EmptyListLabel,
  ExerciseListOptions,
  FavoriteButton,
  ListFilters,
  LoadingSpinner,
  SearchInput,
} from "..";
import { GoToArrowIcon } from "../../assets";
import { FormatSetsCompletedString } from "../../helpers";

type ExerciseModalListProps = {
  handleClickExercise: (exercise: Exercise) => void;
  useExerciseList: UseExerciseListReturnType;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  selectedExercises?: Set<number>;
  isInAnalyticsPage?: boolean;
};

export const ExerciseModalList = ({
  handleClickExercise,
  useExerciseList,
  userSettings,
  setUserSettings,
  selectedExercises,
  isInAnalyticsPage,
}: ExerciseModalListProps) => {
  const {
    toggleFavorite,
    exercises,
    showSecondaryGroups,
    filteredExercises,
    filterQuery,
    setFilterQuery,
    exerciseListFilters,
    isExerciseListLoaded,
    paginatedExercises,
    totalPaginationPages,
    validPaginationPage,
    setPaginationPage,
  } = useExerciseList;

  const { filterMap, removeFilter, prefixMap } = exerciseListFilters;

  const navigate = useNavigate();

  const showPaginationControls = totalPaginationPages > 1;

  const listHeight = showPaginationControls ? "h-[316px]" : "h-[354px]";

  return (
    <div className="h-[450px] flex flex-col gap-1.5">
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
            userSettings={userSettings}
            setUserSettings={setUserSettings}
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
      {isExerciseListLoaded.current ? (
        <div className="flex flex-col justify-between gap-1.5">
          <ScrollShadow className={`${listHeight} flex flex-col gap-1`}>
            {paginatedExercises.map((exercise) => (
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
                  {!showSecondaryGroups ? (
                    <span className="text-xs text-stone-400 text-left">
                      {exercise.formattedGroupStringPrimary}
                    </span>
                  ) : (
                    <>
                      <span className="text-xs text-stone-400 text-left">
                        <span className="font-medium text-stone-600">
                          Primary:
                        </span>{" "}
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
                  isInAnalyticsPage && exercises.length === 0
                    ? "No Exercises Have Been Completed"
                    : undefined
                }
                extraContent={
                  isInAnalyticsPage || exercises.length > 0 ? undefined : (
                    <Link to={"/exercises"}>
                      Create Or Restore Default Exercises Here
                    </Link>
                  )
                }
              />
            )}
          </ScrollShadow>
          {showPaginationControls && (
            <div className="flex justify-center">
              <Pagination
                showControls
                loop
                page={validPaginationPage}
                total={totalPaginationPages}
                onChange={setPaginationPage}
              />
            </div>
          )}
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
};

import { Button, Pagination, ScrollShadow } from "@heroui/react";
import {
  UseWorkoutTemplateListReturnType,
  WorkoutTemplate,
} from "../../typings";
import { useNavigate } from "react-router-dom";
import {
  EmptyListLabel,
  ListFilters,
  LoadingSpinner,
  SearchInput,
  WorkoutTemplateListOptions,
} from "..";
import { GoToArrowIcon } from "../../assets";
import { FormatNumExercisesAndSetsStrings } from "../../helpers";
import {
  LIST_HEIGHT_WITH_PAGINATION,
  LIST_HEIGHT_WITHOUT_PAGINATION,
  MODAL_BODY_HEIGHT,
} from "../../constants";

type WorkoutTemplateModalListProps = {
  useWorkoutTemplateList: UseWorkoutTemplateListReturnType;
  onClickAction: (workoutTemplate: WorkoutTemplate) => void;
  filterWorkoutTemplates?: Set<number>;
};

export const WorkoutTemplateModalList = ({
  useWorkoutTemplateList,
  onClickAction,
  filterWorkoutTemplates,
}: WorkoutTemplateModalListProps) => {
  const {
    filteredWorkoutTemplates,
    filterQuery,
    setFilterQuery,
    workoutTemplates,
    listFilters,
    isWorkoutTemplateListLoaded,
    paginatedWorkoutTemplates,
    totalPaginationPages,
    validPaginationPage,
    setPaginationPage,
  } = useWorkoutTemplateList;

  const { filterMap, removeFilter, prefixMap } = listFilters;

  const navigate = useNavigate();

  const showPaginationControls = totalPaginationPages > 1;

  const listHeight = showPaginationControls
    ? LIST_HEIGHT_WITH_PAGINATION
    : LIST_HEIGHT_WITHOUT_PAGINATION;

  return (
    <div className={`${MODAL_BODY_HEIGHT} flex flex-col gap-1.5`}>
      <div className="flex flex-col gap-1.5">
        <SearchInput
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredWorkoutTemplates.length}
          totalListLength={workoutTemplates.length}
          isListFiltered={filterMap.size > 0}
        />
        <div className="flex justify-between">
          <Button
            color="secondary"
            size="sm"
            variant="flat"
            onPress={() => navigate("/workout-templates")}
            endContent={<GoToArrowIcon />}
          >
            Edit Workout Templates
          </Button>
          <WorkoutTemplateListOptions
            useWorkoutTemplateList={useWorkoutTemplateList}
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
      {isWorkoutTemplateListLoaded.current ? (
        <div className="flex flex-col justify-between gap-1.5">
          <ScrollShadow className={`${listHeight} flex flex-col gap-1`}>
            {paginatedWorkoutTemplates.map((template) => (
              <button
                className={
                  filterWorkoutTemplates?.has(template.id)
                    ? "flex flex-col justify-start items-start bg-amber-100 border-2 border-amber-300 rounded-xl px-2 py-1 hover:border-default-400 focus:border-default-400"
                    : "flex flex-col justify-start items-start bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:border-default-400"
                }
                key={template.id}
                onClick={() => onClickAction(template)}
              >
                <span className="w-full truncate text-left">
                  {template.name}
                </span>
                {template.numSets! > 0 ? (
                  <span className="text-xs text-secondary text-left">
                    {FormatNumExercisesAndSetsStrings(
                      template.exerciseIdSet !== undefined
                        ? template.exerciseIdSet.size
                        : 0,
                      template.numSets
                    )}
                  </span>
                ) : (
                  <span className="text-xs text-stone-400 text-left">
                    Empty
                  </span>
                )}
                {template.note !== null && (
                  <span className="w-full break-all text-xs text-stone-500 text-left">
                    {template.note}
                  </span>
                )}
              </button>
            ))}
            {filteredWorkoutTemplates.length === 0 && (
              <EmptyListLabel itemName="Workout Templates" />
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

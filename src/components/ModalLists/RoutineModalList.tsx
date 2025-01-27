import { Button, ScrollShadow } from "@heroui/react";
import {
  EmptyListLabel,
  ListFilters,
  RoutineListOptions,
  SearchInput,
} from "..";
import {
  FormatNumItemsString,
  FormatRoutineScheduleTypeString,
} from "../../helpers";
import { Routine, UseRoutineListReturnType } from "../../typings";
import { GoToArrowIcon } from "../../assets";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

type RoutineModalListProps = {
  useRoutineList: UseRoutineListReturnType;
  onClickAction: (routine: Routine) => void;
  activeRoutineId?: number;
  highlightedRoutines?: Set<number>;
  customHeightString?: string;
};

export const RoutineModalList = ({
  useRoutineList,
  onClickAction,
  activeRoutineId,
  highlightedRoutines,
  customHeightString,
}: RoutineModalListProps) => {
  const {
    routines,
    filteredRoutines,
    filterQuery,
    setFilterQuery,
    listFilters,
  } = useRoutineList;

  const { filterMap, removeFilter, prefixMap } = listFilters;

  const height = useMemo(() => {
    return customHeightString !== undefined ? customHeightString : "h-[440px]";
  }, []);

  const navigate = useNavigate();

  return (
    <div className={`${height} flex flex-col gap-1.5`}>
      <div className="flex flex-col gap-1.5">
        <SearchInput
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredRoutines.length}
          totalListLength={routines.length}
          isListFiltered={filterMap.size > 0}
        />
        <div className="flex justify-between">
          <Button
            color="secondary"
            size="sm"
            variant="flat"
            onPress={() => navigate("/routines")}
            endContent={<GoToArrowIcon />}
          >
            Edit Routines
          </Button>
          <RoutineListOptions useRoutineList={useRoutineList} />
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
        {filteredRoutines.map((routine) => {
          const numWorkoutTemplates =
            routine.workoutTemplateIdList !== undefined
              ? routine.workoutTemplateIdList.length
              : 0;

          const isActiveRoutine = activeRoutineId === routine.id;
          return (
            <button
              className={
                highlightedRoutines?.has(routine.id)
                  ? "flex justify-between items-center bg-amber-100 border-2 border-amber-300 rounded-xl hover:border-default-400 focus:border-default-400"
                  : "flex justify-between items-center bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:border-default-400"
              }
              key={routine.id}
            >
              <div
                className="flex flex-col justify-start items-start pl-2 py-1"
                onClick={() => onClickAction(routine)}
              >
                <span
                  className={
                    isActiveRoutine
                      ? "w-[16.5rem] truncate text-left"
                      : "w-[23.5rem] truncate text-left"
                  }
                >
                  {routine.name}
                </span>
                {numWorkoutTemplates > 0 && (
                  <span className="text-xs text-secondary text-left">
                    {FormatNumItemsString(numWorkoutTemplates, "Workout")}
                  </span>
                )}
                <span className="text-xs text-stone-400 text-left">
                  {FormatRoutineScheduleTypeString(
                    routine.schedule_type,
                    routine.num_days_in_schedule
                  )}
                </span>
              </div>
              {isActiveRoutine && (
                <div className="pr-2">
                  <div className="flex justify-center px-1.5 py-0.5 text-sm text-success rounded-lg bg-success/10 border-2 border-success/40">
                    Active Routine
                  </div>
                </div>
              )}
            </button>
          );
        })}
        {filteredRoutines.length === 0 && (
          <EmptyListLabel itemName="Routines" />
        )}
      </ScrollShadow>
    </div>
  );
};

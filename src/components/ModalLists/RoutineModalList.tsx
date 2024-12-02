import { Button, ScrollShadow } from "@nextui-org/react";
import { ListFilters, RoutineListOptions, SearchInput } from "..";
import { FormatNumItemsString } from "../../helpers";
import { Routine, UseRoutineListReturnType } from "../../typings";
import { GoToArrowIcon } from "../../assets";
import { useNavigate } from "react-router-dom";

type RoutineModalListProps = {
  useRoutineList: UseRoutineListReturnType;
  onClickAction: (routine: Routine) => void;
  filterRoutines?: Set<number>;
  customHeightString?: string;
};

export const RoutineModalList = ({
  useRoutineList,
  onClickAction,
  filterRoutines,
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

  const height =
    customHeightString !== undefined ? customHeightString : "h-[440px]";

  const navigate = useNavigate();

  return (
    <div className={`${height} flex flex-col gap-1.5`}>
      <div className="flex flex-col gap-1.5">
        <SearchInput
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredRoutines.length}
          totalListLength={routines.length}
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
          />
        )}
      </div>
      <ScrollShadow className="flex flex-col gap-1">
        {filteredRoutines.map((routine) => {
          const numWorkoutTemplates =
            routine.workoutTemplateIdList !== undefined
              ? routine.workoutTemplateIdList.length
              : 0;
          return (
            <div
              className={
                filterRoutines?.has(routine.id)
                  ? "flex justify-between items-center bg-amber-100 border-2 border-amber-300 rounded-xl hover:border-default-400 focus:border-default-400"
                  : "flex justify-between items-center bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:border-default-400"
              }
              key={routine.id}
            >
              <button
                className="flex flex-col justify-start items-start pl-2 py-1"
                onClick={() => onClickAction(routine)}
              >
                <span className="w-[22rem] truncate text-left">
                  {routine.name}
                </span>
                {numWorkoutTemplates > 0 && (
                  <span className="text-xs text-secondary text-left">
                    {FormatNumItemsString(numWorkoutTemplates, "Workout")}
                  </span>
                )}
                <span className="text-xs text-stone-400 text-left">
                  {routine.is_schedule_weekly === 0
                    ? `${routine.num_days_in_schedule} Day Schedule`
                    : "Weekly Schedule"}
                </span>
              </button>
            </div>
          );
        })}
      </ScrollShadow>
    </div>
  );
};

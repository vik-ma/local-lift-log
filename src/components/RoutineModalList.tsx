import { ScrollShadow } from "@nextui-org/react";
import { SearchInput } from ".";
import { FormatNumItemsString } from "../helpers";
import { Routine, UseRoutineListReturnType } from "../typings";

type RoutineModalListProps = {
  useRoutineList: UseRoutineListReturnType;
  onClickAction: (routine: Routine) => void;
  filterRoutines?: Set<number>;
};

export const RoutineModalList = ({
  useRoutineList,
  onClickAction,
  filterRoutines,
}: RoutineModalListProps) => {
  const { routines, filteredRoutines, filterQuery, setFilterQuery } =
    useRoutineList;

  return (
    <div className="h-[440px] flex flex-col gap-2">
      <SearchInput
        filterQuery={filterQuery}
        setFilterQuery={setFilterQuery}
        filteredListLength={filteredRoutines.length}
        totalListLength={routines.length}
      />
      <ScrollShadow className="flex flex-col gap-1">
        {filteredRoutines.map((routine) => {
          const numWorkoutTemplates = routine.numWorkoutTemplates ?? 0;
          return (
            <div
              className={
                filterRoutines?.has(routine.id)
                  ? "flex justify-between items-center bg-amber-100 border-2 border-amber-300 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                  : "flex justify-between items-center bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
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

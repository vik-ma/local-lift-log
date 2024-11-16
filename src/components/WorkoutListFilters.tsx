import { Chip } from "@nextui-org/react";
import { UseWorkoutListReturnType, WorkoutFilterMapKey } from "../typings";
import { useMemo } from "react";

type WorkoutListFiltersProps = {
  useWorkoutList: UseWorkoutListReturnType;
  isInModal?: boolean;
};

export const WorkoutListFilters = ({
  useWorkoutList,
  isInModal,
}: WorkoutListFiltersProps) => {
  const { filterMap, removeFilter } = useWorkoutList;

  const prefixMap = useMemo(() => {
    const prefixMap = new Map<WorkoutFilterMapKey, string>();
    prefixMap.set("dates", "Dates: ");
    prefixMap.set("weekdays", "Days: ");
    prefixMap.set("routines", "Routines: ");
    prefixMap.set("exercises", "Exercises: ");
    prefixMap.set("exercise-groups", "Exercise Groups: ");
    return prefixMap;
  }, []);

  const width = isInModal ? "max-w-[23.25rem]" : "max-w-[22.25rem]";

  return (
    <div className="flex items-center gap-1 text-sm flex-wrap">
      {Array.from(filterMap).map(([key, value]) => (
        <Chip
          key={key}
          classNames={{ content: `${width} truncate` }}
          radius="sm"
          color="secondary"
          variant="flat"
          onClose={() => removeFilter(key)}
        >
          <span className="font-semibold">{prefixMap.get(key)}</span>
          {value}
        </Chip>
      ))}
    </div>
  );
};

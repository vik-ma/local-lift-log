import { Chip } from "@nextui-org/react";
import { UseWorkoutListReturnType } from "../typings";

type WorkoutListFiltersProps = {
  useWorkoutList: UseWorkoutListReturnType;
};

export const WorkoutListFilters = ({
  useWorkoutList,
}: WorkoutListFiltersProps) => {
  const { filterMap, removeFilter } = useWorkoutList;

  return (
    <div className="flex items-center gap-1 text-sm">
      {Array.from(filterMap).map(([key, value]) => (
        <Chip
          key={key}
          radius="sm"
          color="secondary"
          variant="flat"
          onClose={() => removeFilter(key)}
        >
          {value}
        </Chip>
      ))}
    </div>
  );
};

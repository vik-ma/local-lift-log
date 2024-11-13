import { Chip } from "@nextui-org/react";
import { UseWorkoutListReturnType } from "../typings";

type WorkoutListFiltersProps = {
  useWorkoutList: UseWorkoutListReturnType;
  isInModal?: boolean;
};

export const WorkoutListFilters = ({
  useWorkoutList,
  isInModal,
}: WorkoutListFiltersProps) => {
  const { filterMap, removeFilter } = useWorkoutList;

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
          {key === "routines" && (
            <span className="font-semibold">Routines: </span>
          )}
          {value}
        </Chip>
      ))}
    </div>
  );
};

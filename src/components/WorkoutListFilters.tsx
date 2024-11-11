import { Chip } from "@nextui-org/react";

type WorkoutListFiltersProps = {
  filterMap: Map<string, string>;
};

export const WorkoutListFilters = ({ filterMap }: WorkoutListFiltersProps) => {
  return (
    <div className="flex items-center gap-1 text-sm px-0.5">
      {Array.from(filterMap).map(([key, value]) => (
        <Chip
          key={key}
          color="secondary"
          variant="flat"
          onClose={() => console.log("close")}
        >
          {value}
        </Chip>
      ))}
    </div>
  );
};

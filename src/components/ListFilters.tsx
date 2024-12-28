import { Button, Chip } from "@nextui-org/react";
import { ListFilterMapKey, TimePeriodListFilterMapKey } from "../typings";
import { useMemo, useState } from "react";
import { ChevronIcon } from "../assets";

type ListFiltersProps = {
  filterMap: Map<ListFilterMapKey | TimePeriodListFilterMapKey, string>;
  removeFilter: (key: string) => void;
  prefixMap: Map<ListFilterMapKey | TimePeriodListFilterMapKey, string>;
  isInModal?: boolean;
};

export const ListFilters = ({
  filterMap,
  removeFilter,
  prefixMap,
  isInModal,
}: ListFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const chipMaxWidth = useMemo(() => {
    return isInModal ? "max-w-[23.25rem]" : "max-w-[22.25rem]";
  }, [isInModal]);

  return (
    <div className="relative select-none">
      {isExpanded ? (
        <div className="flex items-center gap-1 text-sm flex-wrap">
          {Array.from(filterMap).map(([key, value]) => (
            <Chip
              key={key}
              classNames={{ content: `${chipMaxWidth} truncate` }}
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
      ) : (
        <Chip
          className="font-px-1"
          radius="sm"
          color="secondary"
          variant="flat"
        >
          <span className="font-semibold">{filterMap.size}</span> Filters
          Applied
        </Chip>
      )}
      <div className="absolute right-0 top-0">
        <Button
          aria-label={isExpanded ? "Shrink Filter List" : "Expand Filter List"}
          className="h-full"
          isIconOnly
          variant="light"
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <ChevronIcon
            size={29}
            color="#a8a29e"
            direction={isExpanded ? "up" : "down"}
          />
        </Button>
      </div>
    </div>
  );
};

import { Chip } from "@nextui-org/react";
import { ListFilterMapKey, TimePeriodListFilterMapKey } from "../typings";
import { useMemo, useState } from "react";

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
    <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
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
    </div>
  );
};

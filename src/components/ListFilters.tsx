import { Chip } from "@heroui/react";
import {
  DietLogListFilterMapKey,
  ListFilterMapKey,
  TimePeriodListFilterMapKey,
} from "../typings";
import { useMemo, useState } from "react";
import { ChevronIcon } from "../assets";

type ListFiltersProps = {
  filterMap: Map<
    ListFilterMapKey | TimePeriodListFilterMapKey | DietLogListFilterMapKey,
    string
  >;
  removeFilter: (key: string) => void;
  prefixMap: Map<
    ListFilterMapKey | TimePeriodListFilterMapKey | DietLogListFilterMapKey,
    string
  >;
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
    return isInModal ? "max-w-[21.25rem]" : "max-w-[20.25rem]";
  }, [isInModal]);

  const filterMapHasLessThanTwoItems = useMemo(() => {
    return filterMap.size < 2;
  }, [filterMap]);

  const handleClickAccordion = () => {
    if (filterMapHasLessThanTwoItems) return;

    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={
        filterMapHasLessThanTwoItems
          ? "relative select-none rounded-lg"
          : "relative select-none rounded-lg cursor-pointer hover:bg-amber-50/80"
      }
      onClick={() => handleClickAccordion()}
    >
      {isExpanded || filterMapHasLessThanTwoItems ? (
        <div
          className={
            isInModal
              ? "flex items-center gap-1 text-sm flex-wrap max-w-[23.25rem]"
              : "flex items-center gap-1 text-sm flex-wrap max-w-[22.25rem]"
          }
        >
          {Array.from(filterMap).map(([key, value]) => (
            <Chip
              key={key}
              classNames={{ content: `${chipMaxWidth} truncate` }}
              radius="sm"
              color="secondary"
              variant="flat"
              onClose={() => removeFilter(key)}
              onClick={(e) => e.stopPropagation()}
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
          <span className="font-semibold">
            {filterMap.size} Filters Applied
          </span>
        </Chip>
      )}
      {!filterMapHasLessThanTwoItems && (
        <div className="absolute right-0 top-0">
          <ChevronIcon
            size={29}
            color="#a8a29e"
            direction={isExpanded ? "up" : "down"}
          />
        </div>
      )}
    </div>
  );
};

import { Chip } from "@nextui-org/react";
import { ListFilterMapKey } from "../typings";

type ListFiltersProps = {
  filterMap: Map<ListFilterMapKey, string>;
  removeFilter: (key: ListFilterMapKey) => void;
  prefixMap: Map<ListFilterMapKey, string>;
  isInModal?: boolean;
};

export const ListFilters = ({
  filterMap,
  removeFilter,
  prefixMap,
  isInModal,
}: ListFiltersProps) => {
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

import { Button } from "@nextui-org/react";
import { UseMultisetActionsReturnType } from "../../typings";

type MultisetListOptionsProps = {
  useMultisetActions: UseMultisetActionsReturnType;
};

export const MultisetListOptions = ({
  useMultisetActions,
}: MultisetListOptionsProps) => {
  const { listFilters, handleOpenFilterButton } = useMultisetActions;

  const { filterMap } = listFilters;

  return (
    <div className="flex gap-1">
      <Button
        className="z-1"
        variant="flat"
        color={filterMap.size > 0 ? "secondary" : "default"}
        size="sm"
        onPress={handleOpenFilterButton}
      >
        Filter
      </Button>
    </div>
  );
};

import { Button } from "@heroui/react";
import { UseMultisetActionsReturnType } from "../../typings";

type MultisetListOptionsProps = {
  useMultisetActions: UseMultisetActionsReturnType;
};

export const MultisetListOptions = ({
  useMultisetActions,
}: MultisetListOptionsProps) => {
  const { listFilters, filterMultisetsModal } = useMultisetActions;

  const { filterMap } = listFilters;

  return (
    <div className="flex gap-1">
      <Button
        className="z-1"
        variant="flat"
        color={filterMap.size > 0 ? "secondary" : "default"}
        size="sm"
        onPress={() => filterMultisetsModal.onOpen()}
      >
        Filter
      </Button>
    </div>
  );
};

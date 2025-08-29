import { Button } from "@heroui/react";
import { UseMultisetActionsReturnType, UserSettings } from "../../typings";

type MultisetListOptionsProps = {
  useMultisetActions: UseMultisetActionsReturnType;
  userSettings: UserSettings;
};

export const MultisetListOptions = ({
  useMultisetActions,
  userSettings,
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
        onPress={() => handleOpenFilterButton(userSettings)}
      >
        Filter
      </Button>
    </div>
  );
};

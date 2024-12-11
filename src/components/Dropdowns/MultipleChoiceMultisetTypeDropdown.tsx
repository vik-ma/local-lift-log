import { Select, SelectItem, SharedSelection } from "@nextui-org/react";
import { UseMultisetActionsReturnType } from "../../typings";

type MultipleChoiceMultisetTypeDropdown = {
  useMultisetActions: UseMultisetActionsReturnType;
};

export const MultipleChoiceMultisetTypeDropdown = ({
  useMultisetActions,
}: MultipleChoiceMultisetTypeDropdown) => {
  const { listFilters } = useMultisetActions;

  const { filterMultisetTypes, setFilterMultisetTypes, multisetTypeMap } =
    listFilters;

  return (
    <Select
      selectionMode="multiple"
      label={
        <>
          Multiset Types
          {filterMultisetTypes.size < multisetTypeMap.size && (
            <span className="text-secondary">
              {" "}
              ({filterMultisetTypes.size} out of {multisetTypeMap.size})
            </span>
          )}
        </>
      }
      variant="faded"
      selectedKeys={filterMultisetTypes}
      onSelectionChange={
        setFilterMultisetTypes as React.Dispatch<
          React.SetStateAction<SharedSelection>
        >
      }
      disableAnimation
      disallowEmptySelection
    >
      {Array.from(multisetTypeMap).map(([key, value]) => (
        <SelectItem key={key} value={key}>
          {value}
        </SelectItem>
      ))}
    </Select>
  );
};

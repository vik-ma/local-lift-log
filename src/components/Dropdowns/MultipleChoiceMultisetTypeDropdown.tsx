import { Select, SelectItem, SharedSelection } from "@heroui/react";
import { UseMultisetActionsReturnType } from "../../typings";

type MultipleChoiceMultisetTypeDropdown = {
  useMultisetActions: UseMultisetActionsReturnType;
  filterMultisetTypes: Set<string>;
  setFilterMultisetTypes: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export const MultipleChoiceMultisetTypeDropdown = ({
  useMultisetActions,
  filterMultisetTypes,
  setFilterMultisetTypes,
}: MultipleChoiceMultisetTypeDropdown) => {
  const { listFilters } = useMultisetActions;

  const { multisetTypeMap } = listFilters;

  const handleChange = (keys: SharedSelection) => {
    const updatedFilterMultisetTypes = new Set(keys);

    setFilterMultisetTypes(updatedFilterMultisetTypes as Set<string>);
  };

  return (
    <Select
      selectionMode="multiple"
      label={
        <>
          Multiset Types
          {filterMultisetTypes.size > 0 && (
            <span className="text-secondary">
              {" "}
              ({filterMultisetTypes.size} out of {multisetTypeMap.size})
            </span>
          )}
        </>
      }
      variant="faded"
      size="sm"
      radius="md"
      selectedKeys={filterMultisetTypes}
      onSelectionChange={(keys) => handleChange(keys)}
      disableAnimation
    >
      {Array.from(multisetTypeMap).map(([key, value]) => (
        <SelectItem key={key.toString()}>{value}</SelectItem>
      ))}
    </Select>
  );
};

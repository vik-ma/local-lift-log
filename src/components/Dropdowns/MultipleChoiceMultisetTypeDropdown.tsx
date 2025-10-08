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

  const { multisetTypes } = listFilters;

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
              ({filterMultisetTypes.size} out of {multisetTypes.length})
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
      {multisetTypes.map((multisetType) => (
        <SelectItem key={multisetType}>{multisetType}</SelectItem>
      ))}
    </Select>
  );
};

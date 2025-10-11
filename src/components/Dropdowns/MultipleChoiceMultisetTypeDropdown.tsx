import { Select, SelectItem, SharedSelection } from "@heroui/react";
import { MULTISET_TYPES } from "../../constants";

type MultipleChoiceMultisetTypeDropdown = {
  filterMultisetTypes: Set<string>;
  setFilterMultisetTypes: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export const MultipleChoiceMultisetTypeDropdown = ({
  filterMultisetTypes,
  setFilterMultisetTypes,
}: MultipleChoiceMultisetTypeDropdown) => {
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
              ({filterMultisetTypes.size} out of {MULTISET_TYPES.length})
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
      {MULTISET_TYPES.map((multisetType) => (
        <SelectItem key={multisetType}>{multisetType}</SelectItem>
      ))}
    </Select>
  );
};

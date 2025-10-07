import { Multiset } from "../../typings";
import { useState } from "react";
import { Select, SelectItem } from "@heroui/react";
import { MULTISET_TYPES } from "../../constants";

type MultisetTypeDropdownProps = {
  multiset_type: number;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
};

export const MultisetTypeDropdown = ({
  multiset_type,
  setMultiset,
}: MultisetTypeDropdownProps) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set([multiset_type.toString()])
  );

  const handleChange = async (keys: Set<string>) => {
    if (keys.size !== 1) return;

    const value = keys.values().next().value;

    if (value === undefined || !MULTISET_TYPES.includes(value)) return;

    setSelectedKeys(keys);

    setMultiset((prev) => ({
      ...prev,
      multiset_type: value,
      isEditedInModal: true,
    }));
  };

  return (
    <Select
      aria-label="Multiset Type"
      className="w-[8.5rem]"
      variant="faded"
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => handleChange(keys as Set<string>)}
      disallowEmptySelection
    >
      {MULTISET_TYPES.map(([key, value]) => (
        <SelectItem key={key}>{value}</SelectItem>
      ))}
    </Select>
  );
};

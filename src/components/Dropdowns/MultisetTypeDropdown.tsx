import { useMultisetTypeMap } from "../../hooks";
import { Multiset } from "../../typings";
import { useState } from "react";
import { Select, SelectItem } from "@nextui-org/react";

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

  const multisetTypeMap = useMultisetTypeMap();

  const handleChange = async (keys: Set<string>) => {
    if (keys.size !== 1) return;

    const numberValue = Number(keys.values().next().value);

    if (!multisetTypeMap.has(numberValue)) return;

    setSelectedKeys(keys);

    setMultiset((prev) => ({
      ...prev,
      multiset_type: numberValue,
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
      {Array.from(multisetTypeMap).map(([key, value]) => (
        <SelectItem key={key} value={key}>
          {value}
        </SelectItem>
      ))}
    </Select>
  );
};

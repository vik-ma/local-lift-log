import { useMultisetTypeMap } from "../../hooks";
import { Multiset } from "../../typings";
import { useState } from "react";
import { Select, SelectItem } from "@nextui-org/react";

type MultisetDropdownProps = {
  multiset_type: number;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  isInModal?: boolean;
};

export const MultisetDropdown = ({
  multiset_type,
  setMultiset,
  isInModal,
}: MultisetDropdownProps) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set([multiset_type.toString()])
  );

  const multisetTypeMap = useMultisetTypeMap();

  const handleChange = async (keys: Set<string>) => {
    if (keys.size !== 1) return;

    const numberValue = Number(keys.values().next().value);

    if (!multisetTypeMap.has(numberValue)) return;

    setSelectedKeys(keys);

    if (isInModal) {
      setMultiset((prev) => ({
        ...prev,
        multiset_type: numberValue,
        isEditedInModal: true,
      }));
    } else {
      setMultiset((prev) => ({ ...prev, multiset_type: numberValue }));
    }
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

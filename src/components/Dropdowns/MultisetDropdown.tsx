import { useMultisetTypeMap } from "../../hooks";
import { Multiset } from "../../typings";
import { useState } from "react";
import { Select, SelectItem } from "@nextui-org/react";

type MultisetDropdownProps = {
  multiset_type: number;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
};

export const MultisetDropdown = ({
  multiset_type,
  setMultiset,
}: MultisetDropdownProps) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set([multiset_type.toString()])
  );

  const { multisetTypeMap, validDropdownTypeKeys } = useMultisetTypeMap();

  const handleChange = async (keys: Set<string>) => {
    const stringValue: string = Array.from(keys)[0];

    if (!validDropdownTypeKeys.includes(stringValue)) return;

    const numberValue: number = Number(stringValue);

    setSelectedKeys(keys);
    setMultiset((prev) => ({ ...prev, multiset_type: numberValue }));
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
      {Object.entries(multisetTypeMap).map(([key, value]) => (
        <SelectItem key={key.toString()} value={key.toString()}>
          {value.text}
        </SelectItem>
      ))}
    </Select>
  );
};

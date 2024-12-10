import { useMultisetTypeMap } from "../../hooks";
import { Multiset } from "../../typings";
import { useState, useEffect } from "react";
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
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(
    new Set([multiset_type])
  );

  const multisetTypeMap = useMultisetTypeMap();

  useEffect(() => {
    if (!multisetTypeMap.has(multiset_type)) return;

    setSelectedKeys(new Set([multiset_type]));
  }, [multiset_type, multisetTypeMap]);

  const handleChange = async (keys: Set<number>) => {
    // TODO: FIX
    // const stringValue: string = Array.from(keys)[0];

    // if (!validDropdownTypeKeys.includes(stringValue)) return;

    // console.log(keys)

    // const numberValue: number = Number(stringValue);

    // setSelectedKeys(keys);

    // if (isInModal) {
    //   setMultiset((prev) => ({
    //     ...prev,
    //     multiset_type: numberValue,
    //     isEditedInModal: true,
    //   }));
    // } else {
    //   setMultiset((prev) => ({ ...prev, multiset_type: numberValue }));
    // }
  };

  return (
    <Select
      aria-label="Multiset Type"
      className="w-[8.5rem]"
      variant="faded"
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => handleChange(keys as Set<number>)}
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

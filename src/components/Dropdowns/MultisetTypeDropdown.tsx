import { Multiset } from "../../typings";
import { Select, SelectItem } from "@heroui/react";
import { MULTISET_TYPES } from "../../constants";

type MultisetTypeDropdownProps = {
  multiset_type: string;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
};

export const MultisetTypeDropdown = ({
  multiset_type,
  setMultiset,
}: MultisetTypeDropdownProps) => {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (!MULTISET_TYPES.includes(value)) return;

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
      selectedKeys={[multiset_type]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {MULTISET_TYPES.map((multisetType) => (
        <SelectItem key={multisetType}>{multisetType}</SelectItem>
      ))}
    </Select>
  );
};

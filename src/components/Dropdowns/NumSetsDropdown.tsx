import { Select, SelectItem } from "@nextui-org/react";
import { useNumSetsOptions } from "../../hooks";

type NumSetsDropdownProps = {
  numNewSets: string;
  setNumNewSets: React.Dispatch<React.SetStateAction<string>>;
};

export const NumSetsDropdown = ({
  numNewSets,
  setNumNewSets,
}: NumSetsDropdownProps) => {
  const numSetsOptions = useNumSetsOptions();

  return (
    <Select
      className="w-[12rem]"
      label="Number Of Sets To Add"
      size="sm"
      variant="faded"
      classNames={{
        trigger: "bg-amber-50 border-amber-200",
      }}
      selectedKeys={[numNewSets]}
      onChange={(e) => setNumNewSets(e.target.value)}
      disallowEmptySelection
    >
      {numSetsOptions.map((num) => (
        <SelectItem key={num} value={num}>
          {num}
        </SelectItem>
      ))}
    </Select>
  );
};

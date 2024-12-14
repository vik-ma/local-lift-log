import { Select, SelectItem } from "@nextui-org/react";
import { useNumSetsOptions } from "../../hooks";
import { UserSettings } from "../../typings";

type NumSetsDropdownProps = {
  numNewSets: string;
  targetType: "state" | "settings";
  setNumNewSets?: React.Dispatch<React.SetStateAction<string>>;
  setUserSettings?: React.Dispatch<React.SetStateAction<UserSettings>>;
};

export const NumSetsDropdown = ({
  numNewSets,
  setNumNewSets,
  setUserSettings,
  targetType,
}: NumSetsDropdownProps) => {
  const numSetsOptions = useNumSetsOptions();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "state" && setNumNewSets !== undefined) {
      setNumNewSets(e.target.value);
    }

    if (targetType === "settings" && setUserSettings !== undefined) {
      setUserSettings((prev) => ({
        ...prev,
        default_num_new_sets: e.target.value,
      }));
    }
  };

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
      onChange={(e) => handleChange(e)}
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

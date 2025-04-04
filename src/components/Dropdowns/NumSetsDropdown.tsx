import { Select, SelectItem } from "@heroui/react";
import { useNumSetsOptions } from "../../hooks";

type NumSetsDropdownProps = {
  numNewSets: string;
  targetType: "state" | "settings";
  setNumNewSets?: React.Dispatch<React.SetStateAction<string>>;
  updateUserSettings?: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => Promise<void>;
};

export const NumSetsDropdown = ({
  numNewSets,
  setNumNewSets,
  updateUserSettings,
  targetType,
}: NumSetsDropdownProps) => {
  const numSetsOptions = useNumSetsOptions();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "state" && setNumNewSets !== undefined) {
      setNumNewSets(e.target.value);
    }

    if (targetType === "settings" && updateUserSettings !== undefined) {
      updateUserSettings(e);
    }
  };

  return (
    <Select
      className={targetType === "settings" ? "w-[4rem]" : "w-[12rem]"}
      aria-label="Number Of Sets To Add Dropdown List"
      label={targetType === "settings" ? undefined : "Number Of Sets To Add"}
      size={targetType === "settings" ? "md" : "sm"}
      variant="faded"
      classNames={
        targetType === "settings"
          ? undefined
          : {
              trigger: "bg-amber-50 border-amber-200",
            }
      }
      selectedKeys={[numNewSets]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {numSetsOptions.map((num) => (
        <SelectItem key={num}>{num}</SelectItem>
      ))}
    </Select>
  );
};

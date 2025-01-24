import { Select, SelectItem } from "@heroui/react";
import { HTMLSelectElementChange, UserSettings } from "../../typings";
import { UpdateDefaultDietLogDayIsYesterday } from "../../helpers";

type DietLogDayDropdownProps = {
  value: string;
  targetType: "state" | "settings";
  setState?: React.Dispatch<React.SetStateAction<string>>;
  setUserSettings?: HTMLSelectElementChange;
  userSettings?: UserSettings;
  disabledKeys?: string[];
};

export const DietLogDayDropdown = ({
  value,
  targetType,
  setState,
  setUserSettings,
  userSettings,
  disabledKeys,
}: DietLogDayDropdownProps) => {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "state" && setState !== undefined) {
      setState(e.target.value);

      if (userSettings !== undefined) {
        const value = e.target.value === "Yesterday" ? 1 : 0;
        await UpdateDefaultDietLogDayIsYesterday(value, userSettings.id);
      }
    }

    if (targetType === "settings" && setUserSettings !== undefined) {
      setUserSettings(e);
    }
  };

  return (
    <Select
      className="w-[7.5rem]"
      aria-label="Day Of Diet Entry Dropdown"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      disabledKeys={disabledKeys}
      disallowEmptySelection
    >
      <SelectItem key="Today">Today</SelectItem>
      <SelectItem key="Yesterday">Yesterday</SelectItem>
    </Select>
  );
};

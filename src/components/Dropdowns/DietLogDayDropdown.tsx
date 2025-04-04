import { Select, SelectItem } from "@heroui/react";
import { UserSettings } from "../../typings";
import { UpdateDefaultDietLogDayIsYesterday } from "../../helpers";

type DietLogDayDropdownProps = {
  value: string;
  targetType: "state" | "settings";
  setState?: React.Dispatch<React.SetStateAction<string>>;
  updateUserSettings?: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => Promise<void>;
  userSettings?: UserSettings;
  setUserSettings?: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  disabledKeys?: string[];
};

export const DietLogDayDropdown = ({
  value,
  targetType,
  setState,
  updateUserSettings,
  userSettings,
  setUserSettings,
  disabledKeys,
}: DietLogDayDropdownProps) => {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "state" && setState !== undefined) {
      setState(e.target.value);

      if (userSettings !== undefined && setUserSettings !== undefined) {
        const numValue = e.target.value === "Yesterday" ? 1 : 0;

        const success = await UpdateDefaultDietLogDayIsYesterday(
          numValue,
          userSettings.id
        );

        if (!success) return;

        const updatedUserSettings: UserSettings = {
          ...userSettings,
          default_diet_log_day_is_yesterday: numValue,
        };

        setUserSettings(updatedUserSettings);
      }
    }

    if (targetType === "settings" && updateUserSettings !== undefined) {
      updateUserSettings(e);
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

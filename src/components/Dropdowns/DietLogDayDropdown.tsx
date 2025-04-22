import { Select, SelectItem } from "@heroui/react";
import { UpdateUserSettingFunction, UserSettings } from "../../typings";
import { UpdateUserSetting } from "../../helpers";

type DietLogDayDropdownProps = {
  value: string;
  targetType: "state" | "settings";
  setState?: React.Dispatch<React.SetStateAction<string>>;
  updateUserSetting?: UpdateUserSettingFunction;
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
  updateUserSetting,
  userSettings,
  setUserSettings,
  disabledKeys,
}: DietLogDayDropdownProps) => {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "state" && setState !== undefined) {
      setState(e.target.value);

      if (userSettings !== undefined && setUserSettings !== undefined) {
        const numValue = e.target.value === "Yesterday" ? 1 : 0;

        await UpdateUserSetting(
          "default_diet_log_day_is_yesterday",
          numValue,
          userSettings,
          setUserSettings
        );
      }
    }

    if (targetType === "settings" && updateUserSetting !== undefined) {
      updateUserSetting(
        "default_diet_log_day_is_yesterday",
        e.target.value === "Yesterday" ? 1 : 0
      );
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

import { Select, SelectItem } from "@heroui/react";
import { CALENDAR_DISPLAY_OPTIONS_MAP } from "../../constants";
import { SettingsDropdownProps } from "../../typings";

export const CalendarDisplayOptionsDropdown = ({
  value,
  targetType,
  setValue,
  updateUserSetting,
  isCompact,
}: SettingsDropdownProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "settings" && updateUserSetting !== undefined) {
      updateUserSetting("calendar_display_option", e.target.value);
    }

    if (targetType === "state" && setValue !== undefined) {
      setValue(e.target.value);
    }
  };

  return (
    <Select
      aria-label="Calendar Display Options Dropdown List"
      className={isCompact ? "w-[11.25rem]" : "w-[13.25rem]"}
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {Array.from(CALENDAR_DISPLAY_OPTIONS_MAP).map(([key, value]) => (
        <SelectItem key={key}>{value}</SelectItem>
      ))}
    </Select>
  );
};

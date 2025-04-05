import { Select, SelectItem } from "@heroui/react";
import { SettingsDropdownProps } from "../../typings";

export const ClockStyleDropdown = ({
  value,
  targetType,
  setValue,
  updateUserSetting,
}: SettingsDropdownProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "settings" && updateUserSetting !== undefined) {
      updateUserSetting("clock_style", e.target.value);
    }

    if (targetType === "state" && setValue !== undefined) {
      setValue(e.target.value);
    }
  };

  return (
    <Select
      aria-label="Clock Style Dropdown List"
      className="w-[9.5rem]"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      <SelectItem key="24h">24 Hours</SelectItem>
      <SelectItem key="12h">12 Hours</SelectItem>
    </Select>
  );
};

export default ClockStyleDropdown;

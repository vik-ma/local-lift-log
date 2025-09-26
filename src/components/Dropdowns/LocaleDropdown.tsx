import { Select, SelectItem } from "@heroui/react";
import { SettingsDropdownProps } from "../../typings";
import { LOCALE_MAP } from "../../constants";

export const LocaleDropdown = ({
  value,
  targetType,
  setValue,
  updateUserSetting,
}: SettingsDropdownProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "settings" && updateUserSetting !== undefined) {
      updateUserSetting("locale", e.target.value);
    }

    if (targetType === "state" && setValue !== undefined) {
      setValue(e.target.value);
    }
  };

  return (
    <Select
      aria-label="Locale Dropdown List"
      className="w-[9.5rem]"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {Array.from(LOCALE_MAP).map(([code, label]) => (
        <SelectItem key={code}>{label}</SelectItem>
      ))}
    </Select>
  );
};

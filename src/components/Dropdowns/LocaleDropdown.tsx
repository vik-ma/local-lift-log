import { Select, SelectItem } from "@heroui/react";
import { useLocaleList } from "../../hooks";
import { SettingsDropdownProps } from "../../typings";

export const LocaleDropdown = ({
  value,
  targetType,
  setValue,
  updateUserSetting,
}: SettingsDropdownProps) => {
  const localeList = useLocaleList();

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
      {Array.from(localeList).map(([code, label]) => (
        <SelectItem key={code}>{label}</SelectItem>
      ))}
    </Select>
  );
};

export default LocaleDropdown;

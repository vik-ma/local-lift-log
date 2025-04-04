import { Select, SelectItem } from "@heroui/react";
import { UnitDropdownProps } from "../../typings";
import { useLocaleList } from "../../hooks";

export const LocaleDropdown = ({
  value,
  updateUserSettings,
  setState,
  targetType,
}: UnitDropdownProps) => {
  const localeList = useLocaleList();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "settings" && updateUserSettings !== undefined) {
      updateUserSettings(e);
    }

    if (targetType === "state" && setState !== undefined) {
      setState(e.target.value);
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
      {localeList.map((unit) => (
        <SelectItem key={unit.code}>{unit.label}</SelectItem>
      ))}
    </Select>
  );
};

export default LocaleDropdown;

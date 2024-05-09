import { Select, SelectItem } from "@nextui-org/react";
import { LocaleList } from "../helpers";
import { UnitDropdownProps } from "../typings";

export const LocaleDropdown = ({
  value,
  setUserSettings,
  targetType,
}: UnitDropdownProps) => {
  const localeList = LocaleList();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "locale" && setUserSettings !== undefined) {
      setUserSettings(e);
    }
  };

  return (
    <Select
      aria-label="Locale Dropdown Menu"
      className="w-64"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
    >
      {localeList.map((unit) => (
        <SelectItem key={unit.code} value={unit.code}>
          {unit.label}
        </SelectItem>
      ))}
    </Select>
  );
};

export default LocaleDropdown;

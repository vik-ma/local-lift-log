import { Select, SelectItem } from "@nextui-org/react";
import { LocaleList } from "../helpers";

export const LocaleDropdown = () => {
  const localeList = LocaleList();

  return (
    <Select aria-label="Locale Dropdown Menu" className="w-64" variant="faded">
      {localeList.map((unit) => (
        <SelectItem key={unit.code} value={unit.code}>
          {unit.label}
        </SelectItem>
      ))}
    </Select>
  );
};

export default LocaleDropdown;

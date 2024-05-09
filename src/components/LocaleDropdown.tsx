import { Select, SelectItem } from "@nextui-org/react";
import { LocaleMap } from "../helpers";

export const LocaleDropdown = () => {
  const localeMap = LocaleMap();

  const localeArray: string[] = [...localeMap.keys()];

  return (
    <Select aria-label="Locale Dropdown Menu" className="w-64" variant="faded">
      {localeArray.map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};

export default LocaleDropdown;

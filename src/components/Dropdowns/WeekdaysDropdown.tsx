import { Select, SelectItem } from "@nextui-org/react";

type WeekdaysDropdownProps = {
  values: Set<string>;
  setValues: React.Dispatch<React.SetStateAction<Set<string>>>;
  weekdayMap: Map<string, string>;
};

export const WeekdaysDropdown = ({
  values,
  setValues,
  weekdayMap,
}: WeekdaysDropdownProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const weekdayKeys = e.target.value.split(",");
    // Sort the keys 1-6 numerically, with 0 (Sunday) always last
    weekdayKeys.sort((a, b) => {
      if (a === "0") return 1;
      if (b === "0") return -1;
      return Number(a) - Number(b);
    });

    const updatedSet = new Set(weekdayKeys);
    setValues(updatedSet);
  };

  return (
    <Select
      selectionMode="multiple"
      label="Weekdays"
      variant="faded"
      selectedKeys={values}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {Array.from(weekdayMap).map(([weekdayNum, weekdayLabel]) => (
        <SelectItem key={weekdayNum} value={weekdayNum}>
          {weekdayLabel}
        </SelectItem>
      ))}
    </Select>
  );
};

import { Select, SelectItem, SharedSelection } from "@nextui-org/react";

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
  return (
    <Select
      selectionMode="multiple"
      label="Weekdays"
      variant="faded"
      selectedKeys={values}
      onSelectionChange={
        setValues as React.Dispatch<React.SetStateAction<SharedSelection>>
      }
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
